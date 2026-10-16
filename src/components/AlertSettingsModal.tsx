import React, { useState, useEffect } from 'react';
import { AlertRuleSettings, RegionId } from '../types/airQuality';
import {
  Bell,
  Volume2,
  VolumeX,
  ShieldAlert,
  Heart,
  Sliders,
  Check,
  X,
  Sparkles,
  Info,
} from 'lucide-react';
import {
  requestBrowserPushPermission,
  playAlertChime,
  sendBrowserPushNotification,
} from '../services/notificationService';

interface AlertSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AlertRuleSettings;
  onSaveSettings: (settings: AlertRuleSettings) => void;
  onTriggerTestAlert: () => void;
}

export const AlertSettingsModal: React.FC<AlertSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onTriggerTestAlert,
}) => {
  const [localSettings, setLocalSettings] = useState<AlertRuleSettings>(settings);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const [testSentToast, setTestSentToast] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
    if (typeof Notification !== 'undefined') {
      setPermissionStatus(Notification.permission);
    }
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    const status = await requestBrowserPushPermission();
    setPermissionStatus(status);
    if (status === 'granted') {
      setLocalSettings((prev) => ({ ...prev, browserPushEnabled: true }));
    }
  };

  const handleTestNotification = () => {
    if (localSettings.soundEnabled) {
      playAlertChime('warning');
    }
    onTriggerTestAlert();
    setTestSentToast(true);
    setTimeout(() => setTestSentToast(false), 3000);
  };

  const handleSave = () => {
    onSaveSettings(localSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 text-white max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Air Quality Alert Settings</h2>
              <p className="text-xs text-slate-400">
                Configure push notifications and thresholds for unhealthy Singapore haze.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Master Alert Toggle */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex items-center justify-between mb-5">
          <div>
            <div className="font-semibold text-sm flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-sky-400" />
              Air Quality Alerts Engine
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              Continuously monitor live NEA sensor data and dispatch alerts
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              setLocalSettings((prev) => ({ ...prev, enabled: !prev.enabled }))
            }
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${
              localSettings.enabled ? 'bg-sky-500' : 'bg-slate-700'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                localSettings.enabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Browser Push Permission Status Banner */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 mb-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold flex items-center gap-2">
                <Bell className="w-4 h-4 text-sky-400" />
                Browser Push Notifications
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Receive instant desktop alerts even when the tab is in the background.
              </p>
              <div className="mt-2 text-xs">
                Status:{' '}
                <span
                  className={`font-semibold px-2 py-0.5 rounded-md text-[11px] ${
                    permissionStatus === 'granted'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : permissionStatus === 'denied'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {permissionStatus.toUpperCase()}
                </span>
              </div>
            </div>

            {permissionStatus !== 'granted' && (
              <button
                onClick={handleRequestPermission}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition-all shadow-md shrink-0"
              >
                Enable Push
              </button>
            )}
          </div>
        </div>

        {/* PSI Threshold Selector */}
        <div className="space-y-4 mb-5">
          <label className="block text-sm font-semibold">
            Unhealthy PSI Alert Threshold
            <span className="block text-xs font-normal text-slate-400 mt-0.5">
              Trigger alert when 24-hr PSI exceeds this level (Singapore NEA standard: &gt;100 is Unhealthy).
            </span>
          </label>

          <div className="grid grid-cols-4 gap-2">
            {[
              { val: 50, label: '> 50', desc: 'Moderate' },
              { val: 100, label: '> 100', desc: 'Unhealthy (Default)' },
              { val: 150, label: '> 150', desc: 'Elevated Haze' },
              { val: 200, label: '> 200', desc: 'Very Unhealthy' },
            ].map((opt) => (
              <button
                key={opt.val}
                type="button"
                onClick={() => setLocalSettings((prev) => ({ ...prev, psiThreshold: opt.val }))}
                className={`p-2.5 rounded-xl text-center border transition-all ${
                  localSettings.psiThreshold === opt.val
                    ? 'bg-sky-500/20 border-sky-400 text-white font-bold'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="text-sm font-mono">{opt.label}</div>
                <div className="text-[10px] text-slate-400 mt-0.5 truncate">{opt.desc}</div>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <input
              type="range"
              min={40}
              max={250}
              step={5}
              value={localSettings.psiThreshold}
              onChange={(e) =>
                setLocalSettings((prev) => ({ ...prev, psiThreshold: Number(e.target.value) }))
              }
              className="w-full accent-sky-500 cursor-pointer"
            />
            <span className="font-mono text-base font-bold text-sky-400 shrink-0 min-w-12 text-right">
              {localSettings.psiThreshold}
            </span>
          </div>
        </div>

        {/* Region Target Watch */}
        <div className="space-y-2 mb-5">
          <label className="block text-sm font-semibold">
            Target Watch Region
            <span className="block text-xs font-normal text-slate-400 mt-0.5">
              Select specific location or monitor all Singapore zones.
            </span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'all', label: 'Islandwide (All)' },
              { id: 'west', label: 'West (Jurong)' },
              { id: 'south', label: 'South (CBD/Sentosa)' },
              { id: 'east', label: 'East (Changi/Bedok)' },
              { id: 'north', label: 'North (Woodlands)' },
              { id: 'central', label: 'Central (Bishan)' },
            ].map((reg) => (
              <button
                key={reg.id}
                type="button"
                onClick={() =>
                  setLocalSettings((prev) => ({ ...prev, targetRegion: reg.id as RegionId | 'all' }))
                }
                className={`p-2 rounded-xl text-xs font-medium border text-center transition-all ${
                  localSettings.targetRegion === reg.id
                    ? 'bg-sky-500/20 border-sky-400 text-white font-semibold'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                {reg.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sensitive Groups Mode */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between mb-5">
          <div className="flex items-start gap-2.5">
            <Heart className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
            <div>
              <div className="font-semibold text-xs text-white">Sensitive Demographics Mode</div>
              <div className="text-[11px] text-slate-400">
                Lowers threshold to PSI 80 for pregnant women, elderly, children, and asthma sufferers.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              setLocalSettings((prev) => ({
                ...prev,
                sensitiveGroupMode: !prev.sensitiveGroupMode,
              }))
            }
            className={`w-11 h-5 flex items-center rounded-full p-1 transition-colors duration-200 ${
              localSettings.sensitiveGroupMode ? 'bg-rose-500' : 'bg-slate-700'
            }`}
          >
            <div
              className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform transition-transform duration-200 ${
                localSettings.sensitiveGroupMode ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Audio Sound Toggle */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            {localSettings.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
            <div>
              <div className="font-semibold text-xs text-white">Sound Alert Chime</div>
              <div className="text-[11px] text-slate-400">Synthesised tone when air turns unhealthy</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              const next = !localSettings.soundEnabled;
              setLocalSettings((prev) => ({ ...prev, soundEnabled: next }));
              if (next) playAlertChime('warning');
            }}
            className={`w-11 h-5 flex items-center rounded-full p-1 transition-colors duration-200 ${
              localSettings.soundEnabled ? 'bg-emerald-500' : 'bg-slate-700'
            }`}
          >
            <div
              className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform transition-transform duration-200 ${
                localSettings.soundEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Test Alert Button */}
        <div className="mb-6 flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={handleTestNotification}
            className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-2 transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            Test Push Notification &amp; Chime
          </button>
          {testSentToast && (
            <div className="px-3 py-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs flex items-center gap-1.5 animate-in fade-in">
              <Check className="w-3.5 h-3.5" />
              Test dispatched!
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-xs font-bold text-slate-950 transition-all shadow-lg flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
