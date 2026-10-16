import React from 'react';
import { RegionAirQuality } from '../types/airQuality';
import {
  X,
  MapPin,
  Activity,
  Heart,
  Baby,
  Wind,
  Shield,
  Gauge,
  Info,
} from 'lucide-react';
import { getPM25Band } from '../constants/psiConstants';

interface RegionDetailModalProps {
  region: RegionAirQuality | null;
  isOpen: boolean;
  onClose: () => void;
  onSetAlertForRegion: (regId: string) => void;
}

export const RegionDetailModal: React.FC<RegionDetailModalProps> = ({
  region,
  isOpen,
  onClose,
  onSetAlertForRegion,
}) => {
  if (!isOpen || !region) return null;

  const pm25Band = getPM25Band(region.pm25_1hr);

  const pollutants = [
    {
      name: 'PM2.5 (1-Hour)',
      value: `${region.pm25_1hr} µg/m³`,
      desc: 'Fine particulate matter (penetrates deep into lungs)',
      status: pm25Band.label,
      color: pm25Band.color,
    },
    {
      name: 'PM2.5 (24-Hour)',
      value: `${region.pm25_24hr} µg/m³`,
      desc: '24-hour weighted fine particulate average',
      status: region.pm25_24hr > 55 ? 'Elevated' : 'Normal',
      color: region.pm25_24hr > 55 ? '#f97316' : '#10b981',
    },
    {
      name: 'PM10 (24-Hour)',
      value: `${region.pm10_24hr} µg/m³`,
      desc: 'Coarse dust and smoke particles',
      status: region.pm10_24hr > 100 ? 'High' : 'Normal',
      color: region.pm10_24hr > 100 ? '#f97316' : '#10b981',
    },
    {
      name: 'Ozone (O3 8-Hr)',
      value: `${region.o3} µg/m³`,
      desc: 'Ground-level ozone from sunlight & industrial emissions',
      status: region.o3 > 100 ? 'Elevated' : 'Normal',
      color: region.o3 > 100 ? '#f97316' : '#10b981',
    },
    {
      name: 'Sulphur Dioxide (SO2)',
      value: `${region.so2} µg/m³`,
      desc: 'Fossil fuel combustion & refinery byproduct',
      status: 'Normal',
      color: '#10b981',
    },
    {
      name: 'Carbon Monoxide (CO 8-Hr)',
      value: `${region.co} mg/m³`,
      desc: 'Vehicular exhaust gas concentration',
      status: 'Normal',
      color: '#10b981',
    },
    {
      name: 'Nitrogen Dioxide (NO2)',
      value: `${region.no2} µg/m³`,
      desc: 'Traffic emissions & thermal power operations',
      status: 'Normal',
      color: '#10b981',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 text-white max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold font-mono text-xl shadow-lg border"
              style={{
                backgroundColor: `${region.band.color}20`,
                borderColor: `${region.band.color}60`,
                color: region.band.color,
              }}
            >
              {region.psi}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">{region.displayName}</h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Monitoring Stations: {region.majorTowns.join(' • ')}
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

        {/* Current Band Card */}
        <div
          className={`p-4 rounded-xl border mb-5 flex items-center justify-between ${region.band.badgeBg} ${region.band.badgeBorder}`}
        >
          <div>
            <div className="text-xs uppercase font-bold tracking-wider text-slate-400">
              Singapore NEA Status
            </div>
            <div className={`text-xl font-extrabold ${region.band.badgeText}`}>
              {region.band.name} Air Quality
            </div>
            <p className="text-xs text-slate-300 mt-1">{region.band.description}</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-400">Dominant Pollutant</div>
            <div className="text-sm font-bold text-white font-mono">{region.dominantPollutant}</div>
          </div>
        </div>

        {/* 6 Pollutants Matrix */}
        <div className="mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <Gauge className="w-4 h-4 text-sky-400" />
            Specific Pollutant Concentrations &amp; Sub-Indices
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {pollutants.map((p) => (
              <div
                key={p.name}
                className="bg-slate-950/70 border border-slate-800/80 p-3 rounded-xl flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-semibold text-slate-200">{p.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{p.desc}</div>
                </div>
                <div className="text-right pl-3">
                  <div className="font-mono text-sm font-bold text-white">{p.value}</div>
                  <div className="text-[10px] font-semibold" style={{ color: p.color }}>
                    {p.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* NEA Official Health Advisories */}
        <div className="space-y-3 mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-emerald-400" />
            Official NEA Health Guidelines for this Zone
          </h3>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex items-start gap-3">
            <Activity className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-white">Healthy Individuals</div>
              <div className="text-xs text-slate-300 mt-0.5">{region.band.generalHealthAdvisory}</div>
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex items-start gap-3">
            <Baby className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-white">Elderly, Pregnant Women &amp; Children</div>
              <div className="text-xs text-slate-300 mt-0.5">{region.band.vulnerableAdvisory}</div>
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex items-start gap-3">
            <Heart className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-white">Chronic Heart / Lung Disease (Asthma)</div>
              <div className="text-xs text-slate-300 mt-0.5">{region.band.chronicAdvisory}</div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={() => {
              onSetAlertForRegion(region.id);
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-sky-400 transition-colors"
          >
            Set Alert Rule for {region.name}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-xs font-bold text-slate-950 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
