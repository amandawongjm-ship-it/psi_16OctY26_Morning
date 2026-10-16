import React from 'react';
import { AlertNotificationItem } from '../types/airQuality';
import { AlertTriangle, ShieldAlert, X, ChevronRight, BellRing } from 'lucide-react';

interface UrgentAlertBannerProps {
  activeAlert: AlertNotificationItem | null;
  onDismiss: () => void;
  onOpenAdvisories: () => void;
}

export const UrgentAlertBanner: React.FC<UrgentAlertBannerProps> = ({
  activeAlert,
  onDismiss,
  onOpenAdvisories,
}) => {
  if (!activeAlert) return null;

  const isSevere = activeAlert.psi > 200;

  return (
    <div
      className={`relative z-30 transition-all duration-300 ${
        isSevere
          ? 'bg-rose-950/90 border-b border-rose-500/60 text-rose-100'
          : 'bg-orange-950/90 border-b border-orange-500/60 text-orange-100'
      } backdrop-blur-md px-4 py-3 shadow-xl`}
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-xl shrink-0 ${
              isSevere ? 'bg-rose-500/20 text-rose-300' : 'bg-orange-500/20 text-orange-300'
            }`}
          >
            <ShieldAlert className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-tight text-white">
                {activeAlert.headline}
              </span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-black/40 border border-white/20 font-mono">
                {activeAlert.levelName}
              </span>
            </div>
            <p className="text-xs text-slate-200 mt-0.5 line-clamp-1">
              {activeAlert.recommendation}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <button
            onClick={onOpenAdvisories}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white border border-white/20 flex items-center gap-1 transition-all"
          >
            <span>View Guidelines</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDismiss}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            title="Dismiss Alert Banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
