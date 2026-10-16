import React, { useState } from 'react';
import {
  AirQualitySnapshot,
  RegionAirQuality,
  RegionId,
} from '../types/airQuality';
import { REGIONS_META } from '../constants/psiConstants';
import { Wind, Flame, Eye, Layers, Compass, AlertTriangle, ShieldCheck, MapPin } from 'lucide-react';

interface SingaporeMapProps {
  snapshot: AirQualitySnapshot;
  selectedRegionId: RegionId;
  onSelectRegion: (id: RegionId) => void;
  activeMetric: 'psi' | 'pm25';
  onChangeMetric: (metric: 'psi' | 'pm25') => void;
}

export const SingaporeMap: React.FC<SingaporeMapProps> = ({
  snapshot,
  selectedRegionId,
  onSelectRegion,
  activeMetric,
  onChangeMetric,
}) => {
  const [hoveredRegion, setHoveredRegion] = useState<RegionId | null>(null);
  const [showWindVectors, setShowWindVectors] = useState(true);
  const [showHazeSmoke, setShowHazeSmoke] = useState(true);
  const [showStations, setShowStations] = useState(true);

  // Geographic SVG paths for the 5 official Singapore NEA zones + peripheral islands
  const regionPaths: Record<
    'north' | 'south' | 'east' | 'west' | 'central',
    { d: string; center: { x: number; y: number } }
  > = {
    west: {
      // Covers Tuas, Jurong Lake District, Pioneer, Clementi, Choa Chu Kang, Bukit Batok
      d: 'M 140 330 C 120 370 70 410 40 435 C 30 450 50 480 85 460 C 130 430 160 435 185 410 C 235 435 290 410 320 395 C 355 380 370 330 365 290 C 355 240 310 200 270 200 C 230 200 170 240 150 290 Z',
      center: { x: 230, y: 320 },
    },
    north: {
      // Covers Woodlands, Sembawang, Yishun, Mandai, Simpang
      d: 'M 320 185 C 340 120 410 90 490 85 C 550 80 610 100 625 140 C 625 180 580 215 540 220 C 475 225 410 210 365 210 C 340 210 330 195 320 185 Z',
      center: { x: 470, y: 155 },
    },
    central: {
      // Covers Central Catchment, Ang Mo Kio, Bishan, Toa Payoh, Novena, Bukit Timah
      d: 'M 365 215 C 410 215 480 225 540 225 C 565 235 580 270 575 320 C 565 365 520 380 470 375 C 420 370 380 350 365 315 C 355 270 355 235 365 215 Z',
      center: { x: 460, y: 295 },
    },
    south: {
      // Covers Marina Bay, Tanjong Pagar, Downtown Core, Telok Blangah, Pasir Panjang
      d: 'M 365 385 C 415 380 470 380 520 380 C 575 380 610 400 625 430 C 610 465 570 480 510 475 C 450 470 385 450 355 420 C 345 405 355 390 365 385 Z',
      center: { x: 480, y: 430 },
    },
    east: {
      // Covers Tampines, Bedok, Pasir Ris, Changi, Marine Parade
      d: 'M 580 215 C 630 185 710 180 790 200 C 850 220 890 250 895 285 C 895 320 860 360 800 375 C 720 395 640 400 600 385 C 570 350 565 260 580 215 Z',
      center: { x: 720, y: 290 },
    },
  };

  // Additional surrounding islands (Jurong Island, Sentosa, Pulau Ubin, Pulau Tekong)
  const peripheralIslands = [
    {
      name: 'Jurong Island',
      d: 'M 180 460 C 210 445 270 455 295 485 C 290 515 250 535 200 525 C 170 510 165 480 180 460 Z',
      region: 'west' as RegionId,
    },
    {
      name: 'Sentosa',
      d: 'M 450 495 C 480 485 530 490 550 510 C 540 530 495 535 460 525 C 440 515 440 500 450 495 Z',
      region: 'south' as RegionId,
    },
    {
      name: 'Pulau Ubin',
      d: 'M 720 120 C 760 110 810 125 825 145 C 800 160 750 165 725 150 C 715 140 710 125 720 120 Z',
      region: 'east' as RegionId,
    },
    {
      name: 'Pulau Tekong',
      d: 'M 845 110 C 890 95 940 115 950 145 C 945 185 895 195 850 180 C 835 155 835 125 845 110 Z',
      region: 'east' as RegionId,
    },
  ];

  const getMetricValue = (regionData: RegionAirQuality) => {
    return activeMetric === 'psi' ? regionData.psi : regionData.pm25_1hr;
  };

  const getFillColor = (regionId: RegionId, isHovered: boolean, isSelected: boolean) => {
    const region = snapshot.regions[regionId];
    if (!region) return '#334155';

    const baseColor = region.band.color;
    // Highlight if selected or hovered
    if (isSelected) {
      return baseColor;
    }
    if (isHovered) {
      return baseColor;
    }
    return baseColor;
  };

  const currentHoveredData = hoveredRegion ? snapshot.regions[hoveredRegion] : null;

  return (
    <div className="relative bg-slate-900/90 border border-slate-800 rounded-2xl p-4 md:p-6 shadow-2xl backdrop-blur-md overflow-hidden">
      {/* Background ambient gradient glow */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header and Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 relative z-10 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
            <h2 className="text-lg md:text-xl font-bold text-white tracking-tight flex items-center gap-2">
              Singapore Live Air Quality Map
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono border border-slate-700">
                5 NEA Zones
              </span>
            </h2>
          </div>
          <p className="text-xs md:text-sm text-slate-400 mt-0.5">
            Real-time spatial monitoring across Singapore Island. Click any zone to view localized sensor metrics.
          </p>
        </div>

        {/* View Mode & Layer Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Metric Selector */}
          <div className="bg-slate-950/80 p-1 rounded-xl border border-slate-800 flex items-center text-xs">
            <button
              onClick={() => onChangeMetric('psi')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeMetric === 'psi'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              24-hr PSI
            </button>
            <button
              onClick={() => onChangeMetric('pm25')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeMetric === 'pm25'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              1-hr PM2.5 (µg/m³)
            </button>
          </div>

          {/* Layer toggles */}
          <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setShowWindVectors(!showWindVectors)}
              title="Toggle Wind Vectors"
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-all ${
                showWindVectors ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Wind className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Wind</span>
            </button>

            <button
              onClick={() => setShowHazeSmoke(!showHazeSmoke)}
              title="Toggle Transboundary Haze Smoke Plume Simulation"
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-all ${
                showHazeSmoke ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Haze Layer</span>
            </button>

            <button
              onClick={() => setShowStations(!showStations)}
              title="Toggle Sensor Stations"
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-all ${
                showStations ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sensors</span>
            </button>
          </div>
        </div>
      </div>

      {/* SVG Map Canvas */}
      <div className="relative w-full aspect-[16/10] max-h-[520px] rounded-xl overflow-hidden bg-gradient-to-b from-slate-950 via-[#070b14] to-slate-950 border border-slate-800/80 flex items-center justify-center">
        {/* Maritime Straits Water Grid Pattern */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(148, 163, 184, 0.25) 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* Haze Smoke Simulation Overlay when active and PSI is elevated or toggle enabled */}
        {showHazeSmoke && snapshot.highestPSI > 80 && (
          <div
            className="absolute inset-0 pointer-events-none opacity-25 mix-blend-screen transition-opacity duration-1000"
            style={{
              background: `radial-gradient(circle at 30% 60%, rgba(245, 158, 11, 0.4), transparent 60%), radial-gradient(circle at 70% 40%, rgba(239, 68, 68, 0.3), transparent 60%)`,
            }}
          />
        )}

        {/* Interactive SVG */}
        <svg
          viewBox="0 0 1000 600"
          className="w-full h-full select-none"
          style={{ filter: 'drop-shadow(0px 8px 24px rgba(0, 0, 0, 0.5))' }}
        >
          <defs>
            {/* Filters for glow on active/unhealthy regions */}
            <filter id="alertGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Pattern for regional grid */}
            <pattern id="dotPattern" width="16" height="16" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="#ffffff" fillOpacity="0.08" />
            </pattern>
          </defs>

          {/* Johor / Malaysia northern border watermark indication */}
          <text x="470" y="45" fill="#475569" fontSize="11" textAnchor="middle" letterSpacing="3" fontWeight="600">
            STRAITS OF JOHOR (MALAYSIA NORTH)
          </text>

          {/* Singapore Straits southern watermark */}
          <text x="500" y="580" fill="#475569" fontSize="11" textAnchor="middle" letterSpacing="3" fontWeight="600">
            SINGAPORE STRAITS (INDONESIA SOUTH)
          </text>

          {/* Peripheral Islands */}
          {peripheralIslands.map((island) => {
            const parentRegion = snapshot.regions[island.region];
            const isSelected = selectedRegionId === island.region;
            return (
              <path
                key={island.name}
                d={island.d}
                fill={parentRegion ? parentRegion.band.color : '#334155'}
                fillOpacity={isSelected ? 0.85 : 0.4}
                stroke="#0f172a"
                strokeWidth="1.5"
                className="cursor-pointer transition-all duration-200 hover:fill-opacity-90"
                onClick={() => onSelectRegion(island.region)}
              >
                <title>{`${island.name} (${parentRegion?.name} Region)`}</title>
              </path>
            );
          })}

          {/* Main 5 NEA Regional Zones */}
          {(['west', 'north', 'central', 'south', 'east'] as const).map((regKey) => {
            const pathInfo = regionPaths[regKey];
            const regionData = snapshot.regions[regKey];
            const isHovered = hoveredRegion === regKey;
            const isSelected = selectedRegionId === regKey;
            const isBreaching = regionData?.psi > 100;

            const fillColor = getFillColor(regKey, isHovered, isSelected);

            return (
              <g
                key={regKey}
                onMouseEnter={() => setHoveredRegion(regKey)}
                onMouseLeave={() => setHoveredRegion(null)}
                onClick={() => onSelectRegion(regKey)}
                className="cursor-pointer group transition-transform duration-200"
              >
                {/* Zone Polygon */}
                <path
                  d={pathInfo.d}
                  fill={fillColor}
                  fillOpacity={isSelected ? 0.75 : isHovered ? 0.65 : 0.45}
                  stroke={isSelected ? '#ffffff' : isHovered ? '#94a3b8' : '#1e293b'}
                  strokeWidth={isSelected ? '3.5' : isHovered ? '2.5' : '1.5'}
                  strokeLinejoin="round"
                  filter={isBreaching || isSelected ? 'url(#alertGlow)' : undefined}
                  className="transition-all duration-300"
                />

                {/* Dotted texture overlay */}
                <path
                  d={pathInfo.d}
                  fill="url(#dotPattern)"
                  pointerEvents="none"
                  className="opacity-40"
                />

                {/* Region Name & Metric Display Card on Map */}
                <g transform={`translate(${pathInfo.center.x}, ${pathInfo.center.y})`}>
                  {/* Backdrop Pill */}
                  <rect
                    x="-65"
                    y="-32"
                    width="130"
                    height="64"
                    rx="12"
                    fill="#030712"
                    fillOpacity={isSelected ? 0.95 : 0.85}
                    stroke={isSelected ? '#38bdf8' : regionData?.band.color || '#475569'}
                    strokeWidth={isSelected ? '2.5' : '1.5'}
                    className="shadow-xl"
                  />

                  {/* Region Title */}
                  <text
                    x="0"
                    y="-13"
                    textAnchor="middle"
                    fill="#e2e8f0"
                    fontSize="12"
                    fontWeight="700"
                    letterSpacing="0.5"
                  >
                    {regionData?.name.toUpperCase()}
                  </text>

                  {/* Metric Value */}
                  <text
                    x="0"
                    y="12"
                    textAnchor="middle"
                    fill={regionData?.band.color || '#ffffff'}
                    fontSize="22"
                    fontWeight="800"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    {regionData ? getMetricValue(regionData) : '--'}
                  </text>

                  {/* Metric Label / Subtext */}
                  <text
                    x="0"
                    y="24"
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="8.5"
                    fontWeight="600"
                  >
                    {activeMetric === 'psi' ? '24-HR PSI' : '1-HR PM2.5'} • {regionData?.band.name}
                  </text>
                </g>
              </g>
            );
          })}

          {/* Sensor Station Pin Markers */}
          {showStations &&
            (['west', 'north', 'central', 'south', 'east'] as const).map((regKey) => {
              const pathInfo = regionPaths[regKey];
              const regionData = snapshot.regions[regKey];
              const isBreached = regionData?.psi > 100;

              return (
                <g key={`station-${regKey}`} transform={`translate(${pathInfo.center.x - 70}, ${pathInfo.center.y - 45})`}>
                  {/* Pulsing ring if unhealthy */}
                  {isBreached && (
                    <circle
                      cx="0"
                      cy="0"
                      r="14"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="2"
                      opacity="0.8"
                      className="animate-ping"
                    />
                  )}
                  <circle cx="0" cy="0" r="5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
                  <circle cx="0" cy="0" r="2" fill="#0f172a" />
                </g>
              );
            })}

          {/* Dynamic Monsoon Wind Vector Arrows across Singapore */}
          {showWindVectors && (
            <g opacity="0.65" pointerEvents="none">
              {[
                { x: 180, y: 380 },
                { x: 340, y: 440 },
                { x: 500, y: 500 },
                { x: 620, y: 360 },
                { x: 420, y: 240 },
                { x: 680, y: 220 },
                { x: 820, y: 260 },
              ].map((pos, idx) => (
                <g
                  key={`wind-${idx}`}
                  transform={`translate(${pos.x}, ${pos.y}) rotate(${snapshot.weather.windDegree - 180})`}
                >
                  <line
                    x1="0"
                    y1="18"
                    x2="0"
                    y2="-18"
                    stroke="#38bdf8"
                    strokeWidth="2"
                    strokeDasharray="4 2"
                    strokeLinecap="round"
                  />
                  <polygon points="0,-22 -5,-12 5,-12" fill="#38bdf8" />
                </g>
              ))}
            </g>
          )}
        </svg>

        {/* Hover / Tooltip Floating Card */}
        {currentHoveredData && (
          <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-xs bg-slate-950/95 border border-slate-700/80 p-3.5 rounded-xl shadow-2xl backdrop-blur-md pointer-events-none transition-all duration-150 animate-in fade-in">
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2 mb-2">
              <span className="font-bold text-white text-sm flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                {currentHoveredData.displayName}
              </span>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${currentHoveredData.band.badgeBg} ${currentHoveredData.band.badgeText} border ${currentHoveredData.band.badgeBorder}`}
              >
                {currentHoveredData.band.name}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs mb-2">
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                <div className="text-slate-400">24-hr PSI</div>
                <div className="text-base font-extrabold text-white font-mono">
                  {currentHoveredData.psi}
                </div>
              </div>
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                <div className="text-slate-400">1-hr PM2.5</div>
                <div className="text-base font-extrabold text-white font-mono">
                  {currentHoveredData.pm25_1hr} <span className="text-[10px] font-normal text-slate-400">µg/m³</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-300 leading-tight">
              {currentHoveredData.band.generalHealthAdvisory}
            </p>
          </div>
        )}

        {/* Map Legend Overlay in Bottom Right */}
        <div className="absolute bottom-3 right-3 hidden sm:flex flex-col gap-1.5 bg-slate-950/90 border border-slate-800/80 p-2.5 rounded-xl backdrop-blur-md text-[10px]">
          <div className="text-slate-400 font-semibold mb-0.5 uppercase tracking-wider text-[9px]">
            NEA PSI Band Scale
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-3 h-3 rounded bg-emerald-500 inline-block" />
            <span>0 - 50: Good</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-3 h-3 rounded bg-yellow-500 inline-block" />
            <span>51 - 100: Moderate</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-3 h-3 rounded bg-orange-500 inline-block" />
            <span className="font-semibold text-orange-400">101 - 200: Unhealthy</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-3 h-3 rounded bg-red-500 inline-block" />
            <span className="font-semibold text-red-400">201 - 300: Very Unhealthy</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-3 h-3 rounded bg-rose-900 inline-block border border-rose-600" />
            <span className="font-bold text-rose-300">&gt; 300: Hazardous</span>
          </div>
        </div>
      </div>

      {/* Meteorological Banner Below Map */}
      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="bg-slate-950/60 border border-slate-800/80 p-2.5 rounded-xl flex items-center gap-2">
          <Compass className="w-4 h-4 text-sky-400 shrink-0" />
          <div className="min-w-0">
            <div className="text-[10px] text-slate-400">Wind Direction</div>
            <div className="font-semibold text-white truncate">
              {snapshot.weather.windDirection} ({snapshot.weather.windSpeedKmH} km/h)
            </div>
          </div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 p-2.5 rounded-xl flex items-center gap-2">
          <Flame className="w-4 h-4 text-amber-400 shrink-0" />
          <div className="min-w-0">
            <div className="text-[10px] text-slate-400">Regional Hotspots</div>
            <div className="font-semibold text-white truncate">
              {snapshot.weather.hotspotsSumatra} detected (ASMC)
            </div>
          </div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 p-2.5 rounded-xl flex items-center gap-2">
          <Eye className="w-4 h-4 text-emerald-400 shrink-0" />
          <div className="min-w-0">
            <div className="text-[10px] text-slate-400">Optical Visibility</div>
            <div className="font-semibold text-white truncate">
              {snapshot.weather.visibilityKm} km (Changi MET)
            </div>
          </div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 p-2.5 rounded-xl flex items-center gap-2">
          <Layers className="w-4 h-4 text-purple-400 shrink-0" />
          <div className="min-w-0">
            <div className="text-[10px] text-slate-400">Monsoon Season</div>
            <div className="font-semibold text-white truncate">
              {snapshot.weather.monsoonPeriod}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
