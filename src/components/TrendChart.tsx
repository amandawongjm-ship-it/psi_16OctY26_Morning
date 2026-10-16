import React, { useState } from 'react';
import { HistoricalReading, RegionId } from '../types/airQuality';
import { REGIONS_META } from '../constants/psiConstants';
import { TrendingUp, Clock, Info } from 'lucide-react';

interface TrendChartProps {
  history: HistoricalReading[];
  selectedRegionId: RegionId;
  onSelectRegion: (id: RegionId) => void;
  metric: 'psi' | 'pm25';
  onChangeMetric: (m: 'psi' | 'pm25') => void;
}

export const TrendChart: React.FC<TrendChartProps> = ({
  history,
  selectedRegionId,
  onSelectRegion,
  metric,
  onChangeMetric,
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!history || history.length === 0) return null;

  const width = 800;
  const height = 240;
  const padding = { top: 25, right: 30, bottom: 35, left: 45 };

  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // Determine dynamic max based on data
  let maxVal = 120;
  history.forEach((h) => {
    Object.values(metric === 'psi' ? h.psi : h.pm25).forEach((v) => {
      if (v > maxVal) maxVal = v;
    });
  });
  maxVal = Math.ceil((maxVal * 1.15) / 20) * 20;

  const getX = (idx: number) => padding.left + (idx / (history.length - 1)) * chartW;
  const getY = (val: number) => padding.top + chartH - (val / maxVal) * chartH;

  // Color mapping per region
  const regionColors: Record<RegionId, string> = {
    national: '#38bdf8', // sky
    north: '#a855f7',    // purple
    south: '#06b6d4',    // cyan
    east: '#10b981',     // emerald
    west: '#f97316',     // orange
    central: '#eab308',  // yellow
  };

  // Generate SVG path strings
  const regions: RegionId[] = ['national', 'north', 'south', 'east', 'west', 'central'];

  const linePaths = regions.map((regId) => {
    const points = history.map((h, i) => {
      const val = (metric === 'psi' ? h.psi : h.pm25)[regId] || 0;
      return `${getX(i)},${getY(val)}`;
    });
    return {
      regId,
      path: `M ${points.join(' L ')}`,
      color: regionColors[regId],
    };
  });

  const unhealthyThresholdY = getY(metric === 'psi' ? 100 : 55);
  const goodThresholdY = getY(metric === 'psi' ? 50 : 35);

  const activeHoverData = hoverIndex !== null ? history[hoverIndex] : null;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 md:p-6 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base md:text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-sky-400" />
            24-Hour Air Quality Historical Trend
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Hourly progression showing diurnal pattern and smoke dispersion across zones.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Metric toggle */}
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center text-xs">
            <button
              onClick={() => onChangeMetric('psi')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                metric === 'psi' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              PSI
            </button>
            <button
              onClick={() => onChangeMetric('pm25')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                metric === 'pm25' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              PM2.5 (µg/m³)
            </button>
          </div>
        </div>
      </div>

      {/* Region Legend Toggles */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {regions.map((regId) => {
          const isSelected = selectedRegionId === regId;
          const color = regionColors[regId];
          return (
            <button
              key={regId}
              onClick={() => onSelectRegion(regId)}
              className={`text-xs px-2.5 py-1 rounded-lg font-medium border flex items-center gap-1.5 transition-all ${
                isSelected
                  ? 'bg-slate-800 text-white border-slate-600 shadow-sm'
                  : 'bg-slate-950/50 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
              <span className="capitalize">{regId}</span>
            </button>
          );
        })}
      </div>

      {/* SVG Line Chart */}
      <div className="relative w-full aspect-[21/8] min-h-[220px]">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible select-none"
        >
          {/* Horizontal Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const yVal = Math.round(maxVal * pct);
            const yPos = getY(yVal);
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={yPos}
                  x2={width - padding.right}
                  y2={yPos}
                  stroke="#1e293b"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 8}
                  y={yPos + 4}
                  textAnchor="end"
                  fill="#64748b"
                  fontSize="10"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {yVal}
                </text>
              </g>
            );
          })}

          {/* Unhealthy threshold horizontal indicator */}
          {unhealthyThresholdY >= padding.top && (
            <g>
              <line
                x1={padding.left}
                y1={unhealthyThresholdY}
                x2={width - padding.right}
                y2={unhealthyThresholdY}
                stroke="#f97316"
                strokeWidth="1.5"
                strokeDasharray="6 3"
              />
              <text
                x={width - padding.right}
                y={unhealthyThresholdY - 4}
                textAnchor="end"
                fill="#f97316"
                fontSize="9"
                fontWeight="700"
              >
                UNHEALTHY THRESHOLD ({metric === 'psi' ? '100 PSI' : '55 µg/m³'})
              </text>
            </g>
          )}

          {/* Good threshold */}
          {goodThresholdY <= padding.top + chartH && (
            <line
              x1={padding.left}
              y1={goodThresholdY}
              x2={width - padding.right}
              y2={goodThresholdY}
              stroke="#10b981"
              strokeWidth="1"
              strokeDasharray="3 3"
              opacity="0.5"
            />
          )}

          {/* Regional Lines */}
          {linePaths.map((lp) => {
            const isHighlight = selectedRegionId === lp.regId;
            return (
              <path
                key={lp.regId}
                d={lp.path}
                fill="none"
                stroke={lp.color}
                strokeWidth={isHighlight ? 3.5 : 1.5}
                strokeOpacity={isHighlight ? 1 : 0.35}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-all duration-300"
              />
            );
          })}

          {/* Time axis X labels */}
          {history.map((h, i) => {
            if (i % 3 !== 0 && i !== history.length - 1) return null;
            return (
              <text
                key={i}
                x={getX(i)}
                y={height - 10}
                textAnchor="middle"
                fill="#64748b"
                fontSize="10"
                fontFamily="JetBrains Mono, monospace"
              >
                {h.displayHour}
              </text>
            );
          })}

          {/* Hover interactive vertical scrub line */}
          {hoverIndex !== null && (
            <g>
              <line
                x1={getX(hoverIndex)}
                y1={padding.top}
                x2={getX(hoverIndex)}
                y2={padding.top + chartH}
                stroke="#38bdf8"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
              <circle
                cx={getX(hoverIndex)}
                cy={getY(
                  (metric === 'psi'
                    ? history[hoverIndex].psi
                    : history[hoverIndex].pm25)[selectedRegionId] || 0
                )}
                r="5"
                fill="#38bdf8"
                stroke="#0f172a"
                strokeWidth="2"
              />
            </g>
          )}

          {/* Invisible hover detector columns */}
          {history.map((_, i) => (
            <rect
              key={i}
              x={getX(i) - chartW / history.length / 2}
              y={padding.top}
              width={chartW / history.length}
              height={chartH}
              fill="transparent"
              className="cursor-crosshair"
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
            />
          ))}
        </svg>

        {/* Hover Tooltip Overlay */}
        {activeHoverData && (
          <div className="absolute top-2 left-16 bg-slate-950/95 border border-slate-700 p-2.5 rounded-xl shadow-xl backdrop-blur-md text-xs pointer-events-none flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              <span className="font-mono font-bold text-white">{activeHoverData.displayHour}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="capitalize font-semibold text-sky-300">
                {selectedRegionId}:
              </span>
              <span className="font-mono font-bold text-white text-sm">
                {(metric === 'psi' ? activeHoverData.psi : activeHoverData.pm25)[selectedRegionId]}
              </span>
              <span className="text-[10px] text-slate-400">
                {metric === 'psi' ? 'PSI' : 'µg/m³'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
