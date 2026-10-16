import React from 'react';
import { RegionAirQuality } from '../types/airQuality';
import {
  ShieldAlert,
  Activity,
  Heart,
  Baby,
  Wind,
  Sparkles,
  HelpCircle,
  Home,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

interface HealthAdvisorySectionProps {
  currentRegion: RegionAirQuality;
}

export const HealthAdvisorySection: React.FC<HealthAdvisorySectionProps> = ({
  currentRegion,
}) => {
  const band = currentRegion.band;
  const isUnhealthy = currentRegion.psi > 100;

  const activityBadges = [
    {
      activity: 'Outdoor Running & Cycling',
      status:
        currentRegion.psi <= 50
          ? 'Safe & Encouraged'
          : currentRegion.psi <= 100
          ? 'Normal Activity'
          : currentRegion.psi <= 200
          ? 'Reduce Intensity'
          : 'Avoid Outdoor Training',
      color:
        currentRegion.psi <= 50
          ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
          : currentRegion.psi <= 100
          ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
          : 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    },
    {
      activity: 'Outdoor School & Sports',
      status:
        currentRegion.psi <= 100
          ? 'Unrestricted'
          : currentRegion.psi <= 150
          ? 'Move Indoors If Strenuous'
          : 'Suspended / Indoor Only',
      color:
        currentRegion.psi <= 100
          ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
          : 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    },
    {
      activity: 'Walking & Commuting',
      status:
        currentRegion.psi <= 200
          ? 'Normal Transit'
          : currentRegion.psi <= 300
          ? 'Shorten Exposure'
          : 'Essential Only + N95',
      color:
        currentRegion.psi <= 200
          ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
          : 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    },
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 md:p-6 shadow-xl backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-slate-800/80 pb-4">
        <div>
          <h3 className="text-base md:text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-emerald-400" />
            NEA Singapore Health &amp; Activity Advisory
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Prescribed guidelines based on current 24-hr PSI band ({band.name} - {currentRegion.psi} PSI in {currentRegion.name})
          </p>
        </div>

        <div className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 ${band.badgeBg} ${band.badgeText} ${band.badgeBorder}`}>
          <span>Status:</span>
          <span className="uppercase">{band.outdoorStatus.replace('_', ' ')}</span>
        </div>
      </div>

      {/* 3 Demographic Advisory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-6">
        {/* Healthy Individuals */}
        <div className="bg-slate-950/70 border border-slate-800/80 p-4 rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Activity className="w-4 h-4" />
              <span>Healthy Individuals</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              {band.generalHealthAdvisory}
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
            Maintain hydration; adjust training pace if sensing airway discomfort.
          </div>
        </div>

        {/* Vulnerable Groups */}
        <div className="bg-slate-950/70 border border-slate-800/80 p-4 rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Baby className="w-4 h-4" />
              <span>Elderly &amp; Children</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              {band.vulnerableAdvisory}
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
            Children breathe faster per kg body weight; reduce outdoor playtime during peak hours.
          </div>
        </div>

        {/* Chronic Heart / Lung */}
        <div className="bg-slate-950/70 border border-slate-800/80 p-4 rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Heart className="w-4 h-4" />
              <span>Asthma &amp; Heart Patients</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              {band.chronicAdvisory}
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
            Keep quick-relief inhalers accessible at all times; see a doctor if wheezing worsens.
          </div>
        </div>
      </div>

      {/* Practical Outdoor Activity Guidance Matrix */}
      <div className="mb-6">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Daily Activities Feasibility
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {activityBadges.map((act) => (
            <div
              key={act.activity}
              className="bg-slate-950/50 border border-slate-800 p-3 rounded-xl flex items-center justify-between"
            >
              <div className="text-xs font-medium text-slate-300">{act.activity}</div>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg border ${act.color}`}>
                {act.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Actionable Measures & Protection: N95 & Air Purifiers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl flex items-start gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 shrink-0">
            <Wind className="w-5 h-5" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-white mb-0.5">N95 Mask Guidance</h5>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {band.maskRecommendation} Note: Ordinary surgical masks do not filter fine PM2.5 haze particles effectively. An N95 respirator must form an airtight seal around the nose and mouth.
            </p>
          </div>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl flex items-start gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
            <Home className="w-5 h-5" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-white mb-0.5">Indoor Air Protection</h5>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Keep windows and doors closed during transboundary haze plumes. Run air purifiers equipped with true HEPA filters (Clean Air Delivery Rate CADR &gt; 200 m³/h).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
