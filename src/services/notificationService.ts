import {
  AirQualitySnapshot,
  AlertNotificationItem,
  AlertRuleSettings,
  RegionId,
} from '../types/airQuality';
import { REGIONS_META } from '../constants/psiConstants';

const SETTINGS_KEY = 'sg_airwatch_alert_settings_v1';
const NOTIFICATIONS_KEY = 'sg_airwatch_notifications_v1';
const LAST_NOTIFIED_KEY = 'sg_airwatch_last_alert_record_v1';

export const DEFAULT_ALERT_SETTINGS: AlertRuleSettings = {
  enabled: true,
  psiThreshold: 100, // Singapore NEA "Unhealthy" threshold begins at >100
  pm25Threshold: 55, // 1-hr PM2.5 Elevated begins at >55 µg/m³
  targetRegion: 'all',
  soundEnabled: true,
  browserPushEnabled: true,
  sensitiveGroupMode: false,
  autoRefreshInterval: 60,
};

// Play clean audio alert using Web Audio API (zero external assets needed)
export function playAlertChime(severity: 'warning' | 'urgent' = 'warning') {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (severity === 'urgent') {
      // 3 short warning pulses
      const times = [0, 0.18, 0.36];
      times.forEach((t) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, ctx.currentTime + t); // A5
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + t + 0.12);

        gain.gain.setValueAtTime(0.15, ctx.currentTime + t);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.14);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + t);
        osc.stop(ctx.currentTime + t + 0.15);
      });
    } else {
      // 2 gentle chime notes
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.2);
      osc2.start(ctx.currentTime + 0.15);
      osc2.stop(ctx.currentTime + 0.5);
    }
  } catch (err) {
    console.debug('Audio chime context not ready or blocked by user gesture:', err);
  }
}

export function loadAlertSettings(): AlertRuleSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      return { ...DEFAULT_ALERT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.warn('Failed loading alert settings from storage', e);
  }
  return DEFAULT_ALERT_SETTINGS;
}

export function saveAlertSettings(settings: AlertRuleSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed saving alert settings to storage', e);
  }
}

export function loadNotificationHistory(): AlertNotificationItem[] {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed loading notification history', e);
  }
  return [];
}

export function saveNotificationHistory(items: AlertNotificationItem[]): void {
  try {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(items.slice(0, 50))); // Keep last 50
  } catch (e) {
    console.warn('Failed saving notification history', e);
  }
}

export async function requestBrowserPushPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied';
  }
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.warn('Notification permission error:', err);
    return Notification.permission || 'default';
  }
}

export function sendBrowserPushNotification(title: string, options: NotificationOptions): boolean {
  if (!('Notification' in window)) return false;
  if (Notification.permission !== 'granted') return false;

  try {
    new Notification(title, {
      icon: 'https://images.unsplash.com/photo-1565967511849-76a60a516170?auto=format&fit=crop&w=128&q=80',
      badge: 'https://images.unsplash.com/photo-1565967511849-76a60a516170?auto=format&fit=crop&w=72&q=80',
      ...options,
    });
    return true;
  } catch (err) {
    console.warn('Native notification failed:', err);
    return false;
  }
}

/**
 * Evaluates current air quality against active alert rules.
 * Generates alert items and dispatches push & sound if threshold is breached.
 */
export function evaluateAirQualityAlerts(
  snapshot: AirQualitySnapshot,
  settings: AlertRuleSettings,
  existingHistory: AlertNotificationItem[],
  forceTrigger = false
): { updatedHistory: AlertNotificationItem[]; newAlerts: AlertNotificationItem[] } {
  if (!settings.enabled && !forceTrigger) {
    return { updatedHistory: existingHistory, newAlerts: [] };
  }

  const effectivePsiThreshold = settings.sensitiveGroupMode
    ? Math.min(settings.psiThreshold, 80)
    : settings.psiThreshold;

  const regionsToCheck: RegionId[] =
    settings.targetRegion === 'all'
      ? ['west', 'south', 'east', 'north', 'central', 'national']
      : [settings.targetRegion];

  const newAlerts: AlertNotificationItem[] = [];
  const now = new Date();

  // Load last notified timestamp & value to avoid spamming
  let lastNotifiedRecord: Record<string, { time: number; psi: number }> = {};
  try {
    const saved = localStorage.getItem(LAST_NOTIFIED_KEY);
    if (saved) lastNotifiedRecord = JSON.parse(saved);
  } catch {
    // ignore
  }

  regionsToCheck.forEach((regId) => {
    const regionData = snapshot.regions[regId];
    if (!regionData) return;

    const psiExceeded = regionData.psi > effectivePsiThreshold;
    const pm25Exceeded = regionData.pm25_1hr > settings.pm25Threshold;

    if (psiExceeded || pm25Exceeded || forceTrigger) {
      const record = lastNotifiedRecord[regId];
      const tenMinutes = 10 * 60 * 1000;
      const isRecent = record && now.getTime() - record.time < tenMinutes;
      const hasSignificantJump = record && regionData.psi >= record.psi + 15;

      // Only notify if not recently notified or significant jump or forced
      if (!isRecent || hasSignificantJump || forceTrigger) {
        const regMeta = REGIONS_META[regId];
        const isHazardous = regionData.psi > 300;
        const isVeryUnhealthy = regionData.psi > 200;

        let headline = `Unhealthy Air Alert: ${regMeta.name} PSI ${regionData.psi}`;
        if (isHazardous) {
          headline = `EMERGENCY: Hazardous Air in ${regMeta.name} (PSI ${regionData.psi})`;
        } else if (isVeryUnhealthy) {
          headline = `WARNING: Very Unhealthy Air in ${regMeta.name} (PSI ${regionData.psi})`;
        }

        const alertItem: AlertNotificationItem = {
          id: `alert-${regId}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          timestamp: now.toISOString(),
          regionId: regId,
          regionName: regMeta.name,
          psi: regionData.psi,
          pm25: regionData.pm25_1hr,
          threshold: effectivePsiThreshold,
          levelName: regionData.band.name,
          headline,
          recommendation: settings.sensitiveGroupMode
            ? `${regionData.band.vulnerableAdvisory} ${regionData.band.maskRecommendation}`
            : `${regionData.band.generalHealthAdvisory} ${regionData.band.maskRecommendation}`,
          read: false,
          systemNotified: false,
        };

        // Trigger browser push notification if permitted
        if (settings.browserPushEnabled) {
          const sent = sendBrowserPushNotification(headline, {
            body: `${alertItem.recommendation} (PM2.5: ${regionData.pm25_1hr} µg/m³)`,
            tag: `psi-${regId}`,
          });
          alertItem.systemNotified = sent;
        }

        newAlerts.push(alertItem);
        lastNotifiedRecord[regId] = { time: now.getTime(), psi: regionData.psi };
      }
    }
  });

  if (newAlerts.length > 0) {
    if (settings.soundEnabled) {
      const isUrgent = newAlerts.some((a) => a.psi > 200);
      playAlertChime(isUrgent ? 'urgent' : 'warning');
    }

    try {
      localStorage.setItem(LAST_NOTIFIED_KEY, JSON.stringify(lastNotifiedRecord));
    } catch {
      // ignore
    }

    const updated = [...newAlerts, ...existingHistory].slice(0, 50);
    saveNotificationHistory(updated);
    return { updatedHistory: updated, newAlerts };
  }

  return { updatedHistory: existingHistory, newAlerts: [] };
}
