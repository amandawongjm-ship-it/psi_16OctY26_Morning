import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  AirQualitySnapshot,
  AlertNotificationItem,
  AlertRuleSettings,
  RegionAirQuality,
  RegionId,
} from './types/airQuality';
import {
  fetchLiveAirQuality,
  createSimulatedScenario,
  ScenarioPreset,
} from './services/airQualityService';
import {
  DEFAULT_ALERT_SETTINGS,
  loadAlertSettings,
  saveAlertSettings,
  loadNotificationHistory,
  saveNotificationHistory,
  evaluateAirQualityAlerts,
  playAlertChime,
  sendBrowserPushNotification,
} from './services/notificationService';
import { Navbar } from './components/Navbar';
import { SingaporeMap } from './components/SingaporeMap';
import { RegionCardGrid } from './components/RegionCardGrid';
import { TrendChart } from './components/TrendChart';
import { HealthAdvisorySection } from './components/HealthAdvisorySection';
import { AlertSettingsModal } from './components/AlertSettingsModal';
import { NotificationHistoryModal } from './components/NotificationHistoryModal';
import { RegionDetailModal } from './components/RegionDetailModal';
import { UrgentAlertBanner } from './components/UrgentAlertBanner';
import { HazeSimulatorBanner } from './components/HazeSimulatorBanner';
import {
  ShieldAlert,
  Wind,
  Layers,
  Activity,
  Flame,
  Info,
  Sliders,
  ChevronRight,
  ExternalLink,
  MapPin,
  Clock,
  Sparkles,
} from 'lucide-react';
import { REGIONS_META } from './constants/psiConstants';

export default function App() {
  const [snapshot, setSnapshot] = useState<AirQualitySnapshot | null>(null);
  const [selectedRegionId, setSelectedRegionId] = useState<RegionId>('national');
  const [activeMetric, setActiveMetric] = useState<'psi' | 'pm25'>('psi');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeScenario, setActiveScenario] = useState<ScenarioPreset | 'live'>('live');

  // Alert & Notification States
  const [alertSettings, setAlertSettings] = useState<AlertRuleSettings>(loadAlertSettings);
  const [notifications, setNotifications] = useState<AlertNotificationItem[]>(loadNotificationHistory);
  const [activeUrgentBanner, setActiveUrgentBanner] = useState<AlertNotificationItem | null>(null);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [detailModalRegion, setDetailModalRegion] = useState<RegionAirQuality | null>(null);

  // Auto-refresh timer
  const [countdown, setCountdown] = useState(60);
  const advisoryRef = useRef<HTMLDivElement>(null);

  // Fetch or update data
  const loadData = useCallback(async (isManual = false) => {
    setIsRefreshing(true);
    try {
      let nextSnapshot: AirQualitySnapshot;
      if (activeScenario === 'live') {
        nextSnapshot = await fetchLiveAirQuality();
      } else {
        nextSnapshot = createSimulatedScenario(activeScenario);
      }
      setSnapshot(nextSnapshot);

      // Evaluate alert rules against new data
      const { updatedHistory, newAlerts } = evaluateAirQualityAlerts(
        nextSnapshot,
        alertSettings,
        notifications
      );

      setNotifications(updatedHistory);

      if (newAlerts.length > 0) {
        setActiveUrgentBanner(newAlerts[0]);
      } else {
        // If highest PSI is still over threshold, keep alert banner visible
        const breachingRegion = Object.values(nextSnapshot.regions).find(
          (r) => r.psi > alertSettings.psiThreshold
        );
        if (breachingRegion && !activeUrgentBanner) {
          setActiveUrgentBanner({
            id: `current-breach-${breachingRegion.id}`,
            timestamp: new Date().toISOString(),
            regionId: breachingRegion.id,
            regionName: breachingRegion.name,
            psi: breachingRegion.psi,
            pm25: breachingRegion.pm25_1hr,
            threshold: alertSettings.psiThreshold,
            levelName: breachingRegion.band.name,
            headline: `Alert: Unhealthy Air in ${breachingRegion.name} (PSI ${breachingRegion.psi})`,
            recommendation: breachingRegion.band.generalHealthAdvisory,
            read: false,
            systemNotified: false,
          });
        }
      }
    } finally {
      setIsRefreshing(false);
      setCountdown(alertSettings.autoRefreshInterval || 60);
    }
  }, [activeScenario, alertSettings, notifications, activeUrgentBanner]);

  // Initial load
  useEffect(() => {
    loadData();
  }, [activeScenario]);

  // Countdown timer for auto-refresh
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          loadData();
          return alertSettings.autoRefreshInterval || 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [loadData, alertSettings.autoRefreshInterval]);

  // Handle Scenario preset selection
  const handleSelectScenario = (preset: ScenarioPreset | 'live') => {
    setActiveScenario(preset);
  };

  // Handle Test Alert Dispatch
  const handleDispatchTestAlert = () => {
    if (!snapshot) return;
    const testRegion = snapshot.regions.west || snapshot.regions.national;
    const testAlert: AlertNotificationItem = {
      id: `test-alert-${Date.now()}`,
      timestamp: new Date().toISOString(),
      regionId: testRegion.id,
      regionName: testRegion.name,
      psi: Math.max(testRegion.psi, 118),
      pm25: Math.max(testRegion.pm25_1hr, 72),
      threshold: alertSettings.psiThreshold,
      levelName: 'Unhealthy',
      headline: `🚨 TEST ALERT: Unhealthy Air in ${testRegion.name} (PSI 118)`,
      recommendation: 'Reduce prolonged or strenuous outdoor exertion. Keep windows closed.',
      read: false,
      systemNotified: true,
    };

    if (alertSettings.soundEnabled) {
      playAlertChime('urgent');
    }

    sendBrowserPushNotification(testAlert.headline, {
      body: `${testAlert.recommendation} (PM2.5: ${testAlert.pm25} µg/m³)`,
      tag: 'test-psi',
    });

    const updated = [testAlert, ...notifications].slice(0, 50);
    setNotifications(updated);
    saveNotificationHistory(updated);
    setActiveUrgentBanner(testAlert);
  };

  // Settings save handler
  const handleSaveSettings = (newSettings: AlertRuleSettings) => {
    setAlertSettings(newSettings);
    saveAlertSettings(newSettings);
  };

  // Scroll to advisory
  const handleScrollToAdvisories = () => {
    advisoryRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const selectedRegionData = snapshot?.regions[selectedRegionId] || snapshot?.regions.national;
  const unreadAlertsCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        lastUpdated={snapshot?.updateTimestamp || 'Loading...'}
        isRefreshing={isRefreshing}
        onRefresh={() => loadData(true)}
        countdown={countdown}
        unreadAlertCount={unreadAlertsCount}
        onOpenNotifications={() => setIsHistoryOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onSelectRegion={(id) => setSelectedRegionId(id)}
        nationalPsi={snapshot?.nationalPSI || 48}
        isSimulated={activeScenario !== 'live'}
      />

      {/* Urgent Warning Banner if Threshold Exceeded */}
      <UrgentAlertBanner
        activeAlert={activeUrgentBanner}
        onDismiss={() => setActiveUrgentBanner(null)}
        onOpenAdvisories={handleScrollToAdvisories}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Scenario / Threshold Testing Playground Banner */}
        <HazeSimulatorBanner
          currentStatus={snapshot?.status || 'live'}
          activePreset={activeScenario}
          onSelectPreset={handleSelectScenario}
          onDispatchTestAlert={handleDispatchTestAlert}
        />

        {/* Hero Section: National Status & Headline Highlights */}
        {snapshot && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* National PSI Main Hero Banner */}
            <div className="lg:col-span-3 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl relative overflow-hidden backdrop-blur-md">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Singapore Air Quality Overview
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${snapshot.regions.national.band.badgeBg} ${snapshot.regions.national.band.badgeText} ${snapshot.regions.national.band.badgeBorder}`}
                    >
                      {snapshot.regions.national.band.name} Air Quality
                    </span>
                  </div>

                  <div className="flex items-baseline gap-3">
                    <span
                      className="text-4xl md:text-5xl font-black font-mono tracking-tight"
                      style={{ color: snapshot.regions.national.band.color }}
                    >
                      {snapshot.nationalPSI}
                    </span>
                    <div className="text-slate-400 text-sm">
                      <span className="font-semibold text-slate-200">24-hr PSI</span> (Islandwide Overall)
                      <div className="text-xs text-slate-400">
                        1-hr PM2.5: <span className="font-mono font-bold text-white">{snapshot.regions.national.pm25_1hr} µg/m³</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
                    {snapshot.regions.national.band.generalHealthAdvisory}
                  </p>
                </div>

                {/* Quick Threshold Alert Status Card */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 min-w-[200px] shrink-0">
                  <div className="text-xs font-semibold text-slate-400 flex items-center justify-between">
                    <span>Alert Status</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <div className="text-sm font-bold text-white mt-1">
                    Threshold: &gt; {alertSettings.psiThreshold} PSI
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Target: <span className="text-sky-300 font-semibold capitalize">{alertSettings.targetRegion}</span>
                  </div>
                  <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="mt-2.5 text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-semibold transition-colors"
                  >
                    <span>Configure Alert Rule</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Stat Card: Highest Zone Alert */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between backdrop-blur-md">
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Highest Regional Zone
                </div>
                <div className="text-xl font-extrabold text-white mt-1 capitalize flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-sky-400" />
                  {snapshot.highestRegion} Zone
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  <span
                    className="text-3xl font-black font-mono"
                    style={{ color: snapshot.regions[snapshot.highestRegion].band.color }}
                  >
                    {snapshot.highestPSI}
                  </span>
                  <span className="text-xs text-slate-400">24-hr PSI</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  {snapshot.regions[snapshot.highestRegion].displayName}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Sumatra Hotspots</span>
                <span className="font-mono font-bold text-amber-400">
                  {snapshot.weather.hotspotsSumatra}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Interactive Singapore Map & Selected Zone Focus View */}
        {snapshot && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Interactive Singapore SVG Map (Col span 2) */}
            <div className="lg:col-span-2">
              <SingaporeMap
                snapshot={snapshot}
                selectedRegionId={selectedRegionId}
                onSelectRegion={(id) => setSelectedRegionId(id)}
                activeMetric={activeMetric}
                onChangeMetric={(m) => setActiveMetric(m)}
              />
            </div>

            {/* Selected Zone Focus & Quick Pollutant Inspector (Col span 1) */}
            {selectedRegionData && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md space-y-4">
                <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <div className="text-xs uppercase font-bold text-sky-400 tracking-wider">
                      Selected Region Focus
                    </div>
                    <h3 className="text-lg font-bold text-white mt-0.5">
                      {selectedRegionData.displayName}
                    </h3>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${selectedRegionData.band.badgeBg} ${selectedRegionData.band.badgeText} border ${selectedRegionData.band.badgeBorder}`}
                  >
                    {selectedRegionData.band.name}
                  </span>
                </div>

                {/* Big numbers row */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">24-hr PSI</div>
                    <div
                      className="text-2xl font-black font-mono mt-1"
                      style={{ color: selectedRegionData.band.color }}
                    >
                      {selectedRegionData.psi}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {selectedRegionData.psi <= 100 ? 'Normal Index' : 'Exceeds Threshold'}
                    </div>
                  </div>

                  <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">1-hr PM2.5</div>
                    <div className="text-2xl font-black font-mono text-white mt-1">
                      {selectedRegionData.pm25_1hr}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">µg/m³ concentration</div>
                  </div>
                </div>

                {/* Pollutant snapshot bars */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                    <span>Key Sub-Pollutants</span>
                    <span className="text-[10px] text-slate-400">NEA Sensors</span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between bg-slate-950/50 p-2 rounded-lg border border-slate-800/60">
                      <span className="text-slate-400">PM10 (24-hr)</span>
                      <span className="font-mono font-semibold text-white">
                        {selectedRegionData.pm10_24hr} µg/m³
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-slate-950/50 p-2 rounded-lg border border-slate-800/60">
                      <span className="text-slate-400">Ozone (O3 8-hr)</span>
                      <span className="font-mono font-semibold text-white">
                        {selectedRegionData.o3} µg/m³
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-slate-950/50 p-2 rounded-lg border border-slate-800/60">
                      <span className="text-slate-400">Sulphur Dioxide (SO2)</span>
                      <span className="font-mono font-semibold text-white">
                        {selectedRegionData.so2} µg/m³
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-slate-950/50 p-2 rounded-lg border border-slate-800/60">
                      <span className="text-slate-400">Carbon Monoxide (CO)</span>
                      <span className="font-mono font-semibold text-white">
                        {selectedRegionData.co} mg/m³
                      </span>
                    </div>
                  </div>
                </div>

                {/* Towns list */}
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">
                    Coverage Towns
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {selectedRegionData.majorTowns.map((town) => (
                      <span
                        key={town}
                        className="text-[10px] bg-slate-800/80 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700/60"
                      >
                        {town}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action button */}
                <div className="pt-2">
                  <button
                    onClick={() => setDetailModalRegion(selectedRegionData)}
                    className="w-full py-2.5 px-4 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>Detailed Pollutant Report</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Regional Cards Grid (5 Zones + National) */}
        {snapshot && (
          <RegionCardGrid
            snapshot={snapshot}
            selectedRegionId={selectedRegionId}
            onSelectRegion={(id) => setSelectedRegionId(id)}
            onOpenDetails={(id) => setDetailModalRegion(snapshot.regions[id])}
            onOpenAlertModal={(id) => {
              if (id) {
                setAlertSettings((prev) => ({ ...prev, targetRegion: id }));
              }
              setIsSettingsOpen(true);
            }}
          />
        )}

        {/* 24-Hour Historical Trend Chart */}
        {snapshot && (
          <TrendChart
            history={snapshot.hourlyHistory}
            selectedRegionId={selectedRegionId}
            onSelectRegion={(id) => setSelectedRegionId(id)}
            metric={activeMetric}
            onChangeMetric={(m) => setActiveMetric(m)}
          />
        )}

        {/* Official NEA Health & Activity Advisory Section */}
        {selectedRegionData && (
          <div ref={advisoryRef}>
            <HealthAdvisorySection currentRegion={selectedRegionData} />
          </div>
        )}

        {/* Informative Footer & Government Data Attribution */}
        <footer className="mt-12 pt-8 border-t border-slate-800/80 text-xs text-slate-400 space-y-3 pb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="font-semibold text-slate-200">
                SG AirWatch • Live Singapore PSI &amp; Air Quality Sentinel
              </div>
              <p className="text-[11px] text-slate-400 max-w-xl">
                Air quality readings sourced from the National Environment Agency (NEA) Data.gov.sg API. Health advisories align with the Singapore Ministry of Health (MOH) and NEA guidelines for transboundary haze.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <a
                href="https://www.haze.gov.sg/"
                target="_blank"
                rel="noreferrer"
                className="text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors text-[11px]"
              >
                <span>NEA Haze Portal</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <span className="text-slate-700">•</span>
              <a
                href="https://data.gov.sg/"
                target="_blank"
                rel="noreferrer"
                className="text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors text-[11px]"
              >
                <span>Data.gov.sg</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 border-t border-slate-800/40 pt-3">
            Disclaimer: Air quality advisories are intended for general health guidance. Individuals with preexisting cardio-pulmonary conditions should follow their personal medical action plans.
          </div>
        </footer>
      </main>

      {/* Alert Settings Modal */}
      <AlertSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={alertSettings}
        onSaveSettings={handleSaveSettings}
        onTriggerTestAlert={handleDispatchTestAlert}
      />

      {/* Notification History Log Modal */}
      <NotificationHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        notifications={notifications}
        onClearAll={() => {
          setNotifications([]);
          saveNotificationHistory([]);
        }}
        onMarkAsRead={(id) => {
          const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
          setNotifications(updated);
          saveNotificationHistory(updated);
        }}
      />

      {/* Regional Pollutant Details Modal */}
      <RegionDetailModal
        region={detailModalRegion}
        isOpen={!!detailModalRegion}
        onClose={() => setDetailModalRegion(null)}
        onSetAlertForRegion={(regId) => {
          setAlertSettings((prev) => ({ ...prev, targetRegion: regId as RegionId }));
          setIsSettingsOpen(true);
        }}
      />
    </div>
  );
}
