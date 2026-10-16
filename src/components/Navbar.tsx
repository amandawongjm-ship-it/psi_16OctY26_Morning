import React, { useState } from 'react';
import {
  Bell,
  Sliders,
  RefreshCw,
  Search,
  Share2,
  Check,
  MapPin,
  ShieldAlert,
  Wind,
} from 'lucide-react';
import { RegionId } from '../types/airQuality';
import { searchSingaporeNeighborhood } from '../services/airQualityService';

interface NavbarProps {
  lastUpdated: string;
  isRefreshing: boolean;
  onRefresh: () => void;
  countdown: number;
  unreadAlertCount: number;
  onOpenNotifications: () => void;
  onOpenSettings: () => void;
  onSelectRegion: (id: RegionId) => void;
  nationalPsi: number;
  isSimulated: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  lastUpdated,
  isRefreshing,
  onRefresh,
  countdown,
  unreadAlertCount,
  onOpenNotifications,
  onOpenSettings,
  onSelectRegion,
  nationalPsi,
  isSimulated,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFeedback, setSearchFeedback] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const result = searchSingaporeNeighborhood(searchQuery);
    if (result) {
      onSelectRegion(result.regionId);
      setSearchFeedback(`Found ${result.matchName} -> ${result.regionId.toUpperCase()} Zone`);
      setTimeout(() => setSearchFeedback(null), 3500);
      setSearchQuery('');
    } else {
      setSearchFeedback(`No zone found for "${searchQuery}". Try Woodlands, Jurong, Tampines, Orchard...`);
      setTimeout(() => setSearchFeedback(null), 3500);
    }
  };

  const handleShare = () => {
    const text = `🇸🇬 Singapore AirWatch Live Status: National 24-hr PSI is ${nationalPsi}. Track live regional air quality and set unhealthy haze alerts at ${window.location.href}`;
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-emerald-400 p-0.5 shadow-lg shadow-sky-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Wind className="w-5 h-5 text-sky-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-white">
                  SG AirWatch
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 uppercase tracking-wider">
                  Singapore
                </span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-mono">
                <span>PSI Tracker &amp; Push Alerts</span>
                {isSimulated ? (
                  <span className="text-amber-400 font-semibold">• Demo Mode</span>
                ) : (
                  <span className="text-emerald-400 font-semibold">• Live NEA</span>
                )}
              </div>
            </div>
          </div>

          {/* Search Singapore Neighborhoods / Estates */}
          <div className="hidden md:flex flex-1 max-w-sm mx-4 relative">
            <form onSubmit={handleSearch} className="w-full relative">
              <input
                type="text"
                placeholder="Search town e.g. Woodlands, Jurong, Bedok, Orchard..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
            </form>
            {searchFeedback && (
              <div className="absolute top-11 left-0 right-0 bg-slate-900 border border-sky-500/40 text-sky-300 text-xs p-2 rounded-xl shadow-xl z-50 animate-in fade-in">
                {searchFeedback}
              </div>
            )}
          </div>

          {/* Header Action Tools */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Auto refresh status */}
            <div className="hidden lg:flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-400 font-mono">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Sync {countdown}s</span>
            </div>

            {/* Manual Refresh */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Refresh Live NEA Data"
              className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-sky-400' : ''}`} />
            </button>

            {/* Share / Copy status */}
            <button
              onClick={handleShare}
              title="Copy Air Quality Summary"
              className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all relative"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>

            {/* Notifications Bell with unread counter */}
            <button
              onClick={onOpenNotifications}
              title="View Alerts & Notification Log"
              className="relative p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all"
            >
              <Bell className="w-4 h-4" />
              {unreadAlertCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-bold font-mono text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {unreadAlertCount > 9 ? '9+' : unreadAlertCount}
                </span>
              )}
            </button>

            {/* Alert Settings */}
            <button
              onClick={onOpenSettings}
              title="Alert Rules & Push Configuration"
              className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 hover:bg-sky-500/20 transition-all flex items-center gap-1.5 text-xs font-semibold"
            >
              <Sliders className="w-4 h-4" />
              <span className="hidden sm:inline">Alert Rules</span>
            </button>
          </div>
        </div>

        {/* Mobile search bar */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearch} className="w-full relative">
            <input
              type="text"
              placeholder="Search town (Woodlands, Jurong, Bedok...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          </form>
          {searchFeedback && (
            <div className="mt-1 bg-slate-900 border border-sky-500/40 text-sky-300 text-xs p-2 rounded-xl">
              {searchFeedback}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
