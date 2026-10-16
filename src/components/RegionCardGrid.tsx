import React from 'react';
import { AirQualitySnapshot, RegionId } from '../types/airQuality';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  ShieldAlert,
  Activity,
  Wind,
} from 'lucide-react';

interface RegionCardGridProps {
  snapshot: AirQualitySnapshot;
  selectedRegionId: RegionId;
  onSelectRegion: (id: RegionId) => void;
  onOpenDetails: (id: RegionId) => void;
  onOpenAlertModal: (regionId?: RegionId) => void;
}

export const RegionCardGrid: React.FC<RegionCardGridProps> = ({
  snapshot,
  selectedRegionId,
  onSelectRegion,
  onOpenDetails,
  onOpenAlertModal,
}) => {
  const regionsOrder: RegionId[] = ['national', 'north', 'south', 'east', 'west', 'central'];

  const getTrendIcon = (trend: 'rising' | 'falling' | 'stable') => {
    switch (trend) {
      case 'rising':
        return <TrendingUp className="w-3.5 h-3.5 text-amber-400" />;
      case 'falling':
        return <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <Minus className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            Regional Air Quality Readings
          </h3>
          <p className="text-xs text-slate-400">
            Official 24-hr Pollutant Standards Index (PSI) &amp; 1-hr PM2.5 by NEA monitoring stations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {regionsOrder.map((regId) => {
          const region = snapshot.regions[regId];
          if (!region) return null;

          const isSelected = selectedRegionId === regId;
          const isNational = regId === 'national';
          const isBreached = region.psi > 100;
          const isVeryHigh = region.psi > 200;

          return (
            <div
              key={regId}
              onClick={() => onSelectRegion(regId)}
              className={`group relative rounded-2xl p-4 transition-all duration-200 cursor-pointer border ${
                isSelected
                  ? 'bg-slate-900 border-sky-500 shadow-lg shadow-sky-500/10 ring-1 ring-sky-500/50'
                  : 'bg-slate-900/70 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700'
              } ${isBreached ? 'border-orange-500/40' : ''}`}
            >
              {/* Highlight bar for national or breached cards */}
              {isBreached && (
                <div
                  className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
                  style={{ backgroundColor: region.band.color }}
                />
              )}

              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white text-base tracking-tight truncate">
                      {region.name}
                    </span>
                    {isNational && (
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        Islandwide
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {region.majorTowns.slice(0, 3).join(', ')}
                  </p>
                </div>

                {/* Band Badge */}
                <div
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 ${region.band.badgeBg} ${region.band.badgeText} border ${region.band.badgeBorder}`}
                >
                  {isBreached ? (
                    <ShieldAlert className="w-3.5 h-3.5" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  <span>{region.band.name}</span>
                </div>
              </div>

              {/* Primary Metrics Row */}
              <div className="grid grid-cols-2 gap-2 my-3">
                <div className="bg-slate-950/70 rounded-xl p-2.5 border border-slate-800/60">
                  <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                    24-hr PSI
                  </div>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span
                      className="text-2xl font-black font-mono tracking-tight"
                      style={{ color: region.band.color }}
                    >
                      {region.psi}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">Index</span>
                  </div>
                </div>

                <div className="bg-slate-950/70 rounded-xl p-2.5 border border-slate-800/60">
                  <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                    1-hr PM2.5
                  </div>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-2xl font-black font-mono text-white tracking-tight">
                      {region.pm25_1hr}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">µg/m³</span>
                  </div>
                </div>
              </div>

              {/* Sub-pollutants mini bar */}
              <div className="bg-slate-950/40 rounded-xl p-2 border border-slate-800/40 text-[10px] text-slate-400 flex items-center justify-between mb-3">
                <div>
                  <span className="text-slate-400">PM10: </span>
                  <span className="text-slate-200 font-mono font-medium">{region.pm10_24hr}</span>
                </div>
                <div>
                  <span className="text-slate-400">O3: </span>
                  <span className="text-slate-200 font-mono font-medium">{region.o3}</span>
                </div>
                <div>
                  <span className="text-slate-400">SO2: </span>
                  <span className="text-slate-200 font-mono font-medium">{region.so2}</span>
                </div>
                <div>
                  <span className="text-slate-400">CO: </span>
                  <span className="text-slate-200 font-mono font-medium">{region.co}</span>
                </div>
              </div>

              {/* Advisory teaser */}
              <p className="text-[11px] text-slate-300 line-clamp-1 mb-3">
                {region.band.generalHealthAdvisory}
              </p>

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  {getTrendIcon(region.trend)}
                  <span className="capitalize">{region.trend} trend</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenDetails(regId);
                    }}
                    className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-0.5 transition-colors"
                  >
                    <span>Pollutants</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
