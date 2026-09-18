import React from 'react';
import { 
  Satellite, 
  Waves, 
  Radio, 
  FileText, 
  Layers, 
  Sparkles,
  PhoneCall,
  Activity
} from 'lucide-react';
import { CycloneProfile } from '../types';
import { CYCLONE_PRESETS } from '../data/mockData';
import { SagarShieldLogo } from './SagarShieldLogo';

interface HeaderProps {
  activeTab: 'canvas' | 'audit' | 'dispatcher' | 'deck';
  setActiveTab: (tab: 'canvas' | 'audit' | 'dispatcher' | 'deck') => void;
  selectedCyclone: CycloneProfile;
  setSelectedCyclone: (cyclone: CycloneProfile) => void;
  onOpenDeck: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  selectedCyclone,
  setSelectedCyclone,
  onOpenDeck,
}) => {
  return (
    <header className="border-b border-slate-800/90 bg-slate-950/95 backdrop-blur-md sticky top-0 z-30">
      {/* Top emergency status bar */}
      <div className="bg-slate-900/90 border-b border-slate-800/80 px-4 py-1.5 flex flex-wrap items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-rose-400 font-semibold tracking-wide">
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping inline-block" />
            IMD CYCLONE BULLETIN ACTIVE
          </span>
          <span className="text-slate-700 hidden sm:inline">|</span>
          <span className="hidden sm:flex items-center gap-1 text-cyan-400">
            <Satellite className="w-3.5 h-3.5" />
            Copernicus 30m DEM Slicing (GEE)
          </span>
          <span className="text-slate-700 hidden md:inline">|</span>
          <span className="hidden md:flex items-center gap-1 text-emerald-400">
            <Sparkles className="w-3.5 h-3.5" />
            Gemini 3.7 / 3.8 Flash Reasoning Online
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-amber-300 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded text-[11px] font-mono">
            <PhoneCall className="w-3 h-3 text-amber-400" />
            <span>EOC Hotline: <strong className="text-white">1070 / 1077</strong></span>
          </div>
          <div className="text-slate-400 text-[11px] hidden sm:block font-mono">
            IST: <span className="text-slate-200 font-medium">{new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false })}</span>
          </div>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand identity with bespoke shield + wave logo */}
        <div className="flex items-center gap-3">
          <SagarShieldLogo size="md" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5 font-sans">
                SagarShield <span className="text-cyan-400 font-black">AI</span>
              </h1>
              <span className="px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 text-[10px] font-mono uppercase tracking-wider font-semibold">
                Predictive Inundation Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Fusing IMD Trajectories + GEE Copernicus Elevation Models for Anticipatory Coastal Action
            </p>
          </div>
        </div>

        {/* Cyclone Track Scenario Selector & Modules */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Storm Selector */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg p-1">
            <label className="text-xs text-slate-400 pl-2 font-medium flex items-center gap-1 font-mono">
              <Waves className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden md:inline">Track:</span>
            </label>
            <select
              value={selectedCyclone.id}
              onChange={(e) => {
                const found = CYCLONE_PRESETS.find(p => p.id === e.target.value);
                if (found) setSelectedCyclone(found);
              }}
              className="bg-slate-950 text-slate-100 text-xs rounded border border-slate-700/80 px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 font-medium cursor-pointer"
            >
              {CYCLONE_PRESETS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.state})
                </option>
              ))}
            </select>
          </div>

          {/* Module View Switcher */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('canvas')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                activeTab === 'canvas'
                  ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-950'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Dynamic Risk Canvas</span>
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                activeTab === 'audit'
                  ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-950'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Asset Vulnerability</span>
            </button>

            <button
              onClick={() => setActiveTab('dispatcher')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                activeTab === 'dispatcher'
                  ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-950'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Vernacular Dispatcher</span>
            </button>

            <button
              onClick={onOpenDeck}
              className="px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-all"
              title="Open 12-Slide Hackathon Pitch Deck"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="font-semibold">Pitch Deck (12 Slides)</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
