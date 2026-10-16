import React from 'react';
import { AlertNotificationItem } from '../types/airQuality';
import { Bell, Trash2, CheckCircle2, ShieldAlert, X, Clock, ExternalLink } from 'lucide-react';

interface NotificationHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AlertNotificationItem[];
  onClearAll: () => void;
  onMarkAsRead: (id: string) => void;
}

export const NotificationHistoryModal: React.FC<NotificationHistoryModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onClearAll,
  onMarkAsRead,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 text-white max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Alerts &amp; Notifications Log</h2>
              <p className="text-xs text-slate-400">
                {notifications.length} logged trigger event{notifications.length === 1 ? '' : 's'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
                title="Clear all alerts"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <CheckCircle2 className="w-10 h-10 text-emerald-400/50 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-300">No active unhealthy air alerts</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Singapore air quality has remained below your configured alert threshold.
              </p>
            </div>
          ) : (
            notifications.map((item) => {
              const date = new Date(item.timestamp);
              const formattedTime = date.toLocaleTimeString('en-SG', {
                hour: '2-digit',
                minute: '2-digit',
                day: '2-digit',
                month: 'short',
              });

              const isHazardous = item.psi > 300;
              const isVeryUnhealthy = item.psi > 200;

              return (
                <div
                  key={item.id}
                  onClick={() => onMarkAsRead(item.id)}
                  className={`p-3.5 rounded-xl border transition-all ${
                    !item.read
                      ? 'bg-slate-950/80 border-orange-500/40 shadow-sm'
                      : 'bg-slate-950/40 border-slate-800/80 opacity-80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isHazardous
                            ? 'bg-rose-500 animate-ping'
                            : isVeryUnhealthy
                            ? 'bg-red-500'
                            : 'bg-orange-500'
                        }`}
                      />
                      <span className="font-semibold text-xs text-white">
                        {item.headline}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span>{formattedTime}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 mb-2 pl-4">
                    {item.recommendation}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pl-4 border-t border-slate-800/60 pt-2 mt-1">
                    <div>
                      <span>Recorded 24-hr PSI: </span>
                      <span className="font-bold text-orange-400 font-mono">{item.psi}</span>
                      <span className="mx-1.5">•</span>
                      <span>PM2.5: </span>
                      <span className="font-bold text-slate-200 font-mono">{item.pm25} µg/m³</span>
                    </div>

                    {!item.read && (
                      <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded font-medium">
                        New
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
