import React from 'react';
import { ScenarioPreset } from '../services/airQualityService';
import { Sparkles, Play, RotateCcw, AlertTriangle, ShieldCheck, Flame } from 'lucide-react';

interface HazeSimulatorBannerProps {
  currentStatus: 'live' | 'cached' | 'simulated';
  activePreset: ScenarioPreset | 'live';
  onSelectPreset: (preset: ScenarioPreset | 'live') => void;
  onDispatchTestAlert: () => void;
}

export const HazeSimulatorBanner: React.FC<HazeSimulatorBannerProps> = ({
  currentStatus,
  activePreset,
  onSelectPreset,
  onDispatchTestAlert,
}) => {
  return (
    <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-rose-950/30 border border-amber-500/30 rounded-2xl p-3.5 md:p-4 shadow-lg backdrop-blur-md">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                Air Quality Scenario &amp; Alert Simulator
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                Front-End Testing Playground
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Simulate haze spikes and unhealthy threshold breaches to test push notifications, map colors, and advisories.
            </p>
          </div>
        </div>

        {/* Preset Selector Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => onSelectPreset('live')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
              activePreset === 'live'
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md font-bold'
                : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Live NEA Data</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectPreset('unhealthy_west')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
              activePreset === 'unhealthy_west'
                ? 'bg-orange-500 text-slate-950 border-orange-400 shadow-md font-bold'
                : 'bg-slate-950/80 text-orange-300 border-orange-500/30 hover:bg-orange-500/10'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
            <span>Simulate Unhealthy (PSI 135)</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectPreset('islandwide_unhealthy')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
              activePreset === 'islandwide_unhealthy'
                ? 'bg-red-500 text-white border-red-400 shadow-md font-bold'
                : 'bg-slate-950/80 text-red-300 border-red-500/30 hover:bg-red-500/10'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-red-400" />
            <span>Islandwide Haze (PSI 148)</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectPreset('severe_crisis')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
              activePreset === 'severe_crisis'
                ? 'bg-rose-900 text-white border-rose-500 shadow-md font-bold'
                : 'bg-slate-950/80 text-rose-300 border-rose-500/30 hover:bg-rose-900/20'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>Hazardous Crisis (PSI 315)</span>
          </button>

          <button
            type="button"
            onClick={onDispatchTestAlert}
            title="Dispatch a push alert now"
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-all flex items-center gap-1"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Dispatch Test Push</span>
          </button>
        </div>
      </div>
    </div>
  );
};
