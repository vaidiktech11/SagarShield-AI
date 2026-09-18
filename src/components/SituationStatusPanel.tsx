import React, { useState } from 'react';
import { InfrastructureAsset, CycloneTrackPoint } from '../types';
import {
  AlertTriangle,
  ZapOff,
  Route,
  Waves,
  PhoneCall,
  Sparkles,
  ArrowUpRight,
  ShieldAlert,
  Clock,
  Radio,
  Copy,
  Check,
  Compass,
  Building2,
  Wind
} from 'lucide-react';

interface SituationStatusPanelProps {
  assets: InfrastructureAsset[];
  currentTrackPoint: CycloneTrackPoint;
  cycloneName: string;
  cycloneState: string;
  onSynthesizePlan: () => void;
  loadingPlan: boolean;
}

export const SituationStatusPanel: React.FC<SituationStatusPanelProps> = ({
  assets,
  currentTrackPoint,
  cycloneName,
  cycloneState,
  onSynthesizePlan,
  loadingPlan,
}) => {
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);

  const currentSurge = currentTrackPoint.surgeHeightMeters;
  const submergedAssets = assets.filter((a) => a.elevationMeters <= currentSurge);
  const severedRoads = assets.filter(
    (a) => a.category === 'road' && a.elevationMeters <= currentSurge
  );
  const threatenedSubstations = assets.filter(
    (a) => a.category === 'substation' && a.elevationMeters <= currentSurge + 0.5
  );

  const handleCopyHotline = (number: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(number);
    setCopiedNumber(number);
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  const eocHotlines = [
    {
      code: '1070',
      label: 'State EOC Hotline',
      agency: `${cycloneState} State Disaster Management Authority (SDMA)`,
      status: '24x7 Priority Line',
      badge: 'SEOC Active',
    },
    {
      code: '1077',
      label: 'District Control',
      agency: 'District Collectorate Emergency Operations',
      status: 'Direct Field Command',
      badge: 'DDCR Live',
    },
    {
      code: '112',
      label: 'National Emergency',
      agency: 'ODRAF / NDRF / Police / Fire Services',
      status: 'Rapid Tactical Response',
      badge: 'ERSS Line',
    },
    {
      code: '1554',
      label: 'Coast Guard SAR',
      agency: 'Indian Coast Guard Maritime Search & Rescue',
      status: 'Offshore Patrol Vessel Net',
      badge: 'Marine SAR',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Verbatim Critical Alert Banner */}
      <div
        id="critical-inundation-alert-banner"
        className="relative overflow-hidden rounded-xl border border-rose-500/60 bg-gradient-to-r from-rose-950/90 via-slate-900/95 to-rose-950/80 p-4 shadow-xl shadow-rose-950/30"
      >
        <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500" />
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pl-2">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-rose-600/20 border border-rose-500/40 text-rose-400 shrink-0 mt-0.5 animate-pulse">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-wider bg-rose-600 text-white font-mono">
                  Critical Alert
                </span>
                <span className="text-xs font-semibold text-rose-300 flex items-center gap-1.5 font-mono">
                  <Clock className="w-3.5 h-3.5 text-rose-400" />
                  T-Minus: {currentTrackPoint.timeOffsetHours < 0 ? `${Math.abs(currentTrackPoint.timeOffsetHours)}h Pre-Landfall (${currentTrackPoint.timeLabel})` : currentTrackPoint.timeOffsetHours === 0 ? 'LANDFALL ONGOING (T-0h)' : `Post-Landfall +${currentTrackPoint.timeOffsetHours}h`}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  | Location Scope: Coastal Bhadrak & Kendrapara Shoreline
                </span>
              </div>
              <p className="text-xs md:text-sm text-slate-200 font-medium leading-relaxed max-w-4xl">
                <strong className="text-rose-300 font-bold">
                  CRITICAL 6-12h PRE-LANDFALL CORRIDOR SEVERANCE:
                </strong>{' '}
                Coastal roads and causeways (SH-9, Talchua) are currently overtopping 6 to 12 hours prior to eye landfall due to tidal wave runup superposition. Evacuation convoys must be dispatched before water crosses 0.5m threshold!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
            <button
              id="synthesize-district-plan-btn"
              onClick={onSynthesizePlan}
              disabled={loadingPlan}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-cyan-900/40 transition-all border border-cyan-400/40 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-cyan-200" />
              <span>{loadingPlan ? 'Synthesizing with Gemini...' : 'Synthesize District SOP'}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Refined Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric Card 1: Submerged Coastal Assets */}
        <div
          id="metric-submerged-assets"
          className="bg-slate-900/90 border border-slate-800/90 hover:border-rose-500/50 rounded-xl p-3.5 flex flex-col justify-between transition-all shadow-md group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Submerged Assets</span>
            <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white font-mono">{submergedAssets.length}</span>
              <span className="text-xs text-slate-400 font-mono">/ {assets.length} total</span>
            </div>
            <div className="mt-1 text-[11px] text-rose-300 font-medium truncate">
              {submergedAssets.length > 0
                ? `${submergedAssets.map((a) => a.name.split(' ')[0]).join(', ')} overtopped`
                : 'All assets currently elevated'}
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span>Copernicus 30m DEM</span>
            <span className="text-rose-400 font-semibold">&Delta; &lt; 0.0m</span>
          </div>
        </div>

        {/* Metric Card 2: Substation Flashover Arc Hazard */}
        <div
          id="metric-substation-hazard"
          className="bg-slate-900/90 border border-slate-800/90 hover:border-amber-500/50 rounded-xl p-3.5 flex flex-col justify-between transition-all shadow-md group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Substation Flashover</span>
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 group-hover:scale-105 transition-transform">
              <ZapOff className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-300 font-mono">{threatenedSubstations.length}</span>
              <span className="text-xs text-slate-400 font-mono">Grid Feeders</span>
            </div>
            <div className="mt-1 text-[11px] text-amber-300/90 font-medium truncate">
              Dhamra Port 132/33kV Switchyard
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span>Saltwater Arc Hazard</span>
            <span className="text-amber-400 font-semibold">Margin &le; 0.5m</span>
          </div>
        </div>

        {/* Metric Card 3: Evacuation Corridors Severed */}
        <div
          id="metric-corridors-severed"
          className="bg-slate-900/90 border border-slate-800/90 hover:border-indigo-500/50 rounded-xl p-3.5 flex flex-col justify-between transition-all shadow-md group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Corridors Cut Off</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 group-hover:scale-105 transition-transform">
              <Route className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-indigo-300 font-mono">{severedRoads.length}</span>
              <span className="text-xs text-slate-400 font-mono">Routes Blocked</span>
            </div>
            <div className="mt-1 text-[11px] text-indigo-300/90 font-medium truncate">
              SH-9 Km 42 &amp; Talchua Causeway
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span>6-12h Pre-Landfall</span>
            <span className="text-indigo-400 font-semibold">Tidal Runup Superposition</span>
          </div>
        </div>

        {/* Metric Card 4: Peak Simulated Surge Runup */}
        <div
          id="metric-peak-surge"
          className="bg-slate-900/90 border border-slate-800/90 hover:border-cyan-500/50 rounded-xl p-3.5 flex flex-col justify-between transition-all shadow-md group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Peak Surge Runup</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 group-hover:scale-105 transition-transform">
              <Waves className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-cyan-300 font-mono">
                +{currentSurge.toFixed(1)}m
              </span>
              <span className="text-xs text-slate-400 font-mono">above MSL</span>
            </div>
            <div className="mt-1 text-[11px] text-cyan-300/90 font-medium truncate">
              {currentTrackPoint.windSpeedKmph} km/h • {currentTrackPoint.centralPressureHpa} hPa
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span>Tidal Wave Superposition</span>
            <span className="text-cyan-400 font-semibold">SLOSH + GEE Mesh</span>
          </div>
        </div>
      </div>

      {/* Dedicated Status Panel: Technical Telemetry & EOC Hotlines */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Technical Data Stream */}
        <div
          id="technical-telemetry-panel"
          className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-white tracking-wide uppercase font-mono">
                Live Hydro-Spatial Telemetry
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] text-emerald-400 font-mono font-medium">GEE + IMD Sync Active</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 my-3 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <div className="text-[10px] text-slate-400 font-mono uppercase">Simulation Target</div>
              <div className="text-sm font-bold text-white mt-0.5">{cycloneName}</div>
              <div className="text-[10px] text-cyan-400 font-mono">{cycloneState} Coast</div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <div className="text-[10px] text-slate-400 font-mono uppercase">Current Eye Position</div>
              <div className="text-sm font-bold text-white mt-0.5 font-mono">
                {currentTrackPoint.lat.toFixed(2)}°N, {currentTrackPoint.lng.toFixed(2)}°E
              </div>
              <div className="text-[10px] text-slate-400 font-mono">Bay of Bengal Head</div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <div className="text-[10px] text-slate-400 font-mono uppercase">Est. Rainfall Rate</div>
              <div className="text-sm font-bold text-amber-300 mt-0.5 font-mono">
                {Math.round(currentTrackPoint.windSpeedKmph * 0.28) + 15} mm/hr
              </div>
              <div className="text-[10px] text-amber-400/80 font-mono">Flash Flood Surcharge</div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <div className="text-[10px] text-slate-400 font-mono uppercase">Vulnerable Coastal Assets</div>
              <div className="text-sm font-bold text-white mt-0.5 font-mono">
                6 Monitored Sites
              </div>
              <div className="text-[10px] text-slate-400 font-mono">Bhadrak District</div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <div className="text-[10px] text-slate-400 font-mono uppercase">High Hazard Corridor</div>
              <div className="text-sm font-bold text-rose-300 mt-0.5 font-mono">
                Talchua Causeway
              </div>
              <div className="text-[10px] text-rose-400 font-mono">DEM: 1.4m (Cut Off)</div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <div className="text-[10px] text-slate-400 font-mono uppercase">Anticipatory Lead Time</div>
              <div className="text-sm font-bold text-cyan-300 mt-0.5 font-mono">
                6 to 12 Hours
              </div>
              <div className="text-[10px] text-cyan-400 font-mono">Pre-Landfall Action</div>
            </div>
          </div>

          <div className="p-2 rounded bg-slate-950/80 border border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-cyan-400" />
              Verified Locations: Talchua Causeway (1.4m), Dhamra PHC (1.8m), Dhamra Port Substation (2.1m)
            </span>
            <span className="text-cyan-400 font-semibold">Gemini 3.7 Flash</span>
          </div>
        </div>

        {/* EOC Hotline Call-outs Card */}
        <div
          id="eoc-hotline-panel"
          className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/50 border border-indigo-900/40 rounded-xl p-3.5 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white tracking-wide uppercase font-mono">
                Emergency Operation Centre (EOC) Hotline
              </span>
            </div>
            <span className="px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300 text-[10px] font-mono font-bold">
              PRIORITY RED-LINE
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 my-2.5">
            {eocHotlines.map((hotline) => (
              <div
                key={hotline.code}
                onClick={(e) => handleCopyHotline(hotline.code, e)}
                className="group relative p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/90 hover:border-emerald-500/50 cursor-pointer transition-all hover:bg-slate-900"
                title={`Click to copy ${hotline.label} (${hotline.code})`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-medium text-slate-400 truncate">{hotline.label}</span>
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/50">
                    {hotline.badge}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-black font-mono tracking-tight text-white group-hover:text-emerald-300 transition-colors">
                    {hotline.code}
                  </span>
                  <div className="text-slate-500 group-hover:text-emerald-400 transition-colors p-1">
                    {copiedNumber === hotline.code ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </div>
                </div>
                <div className="text-[10px] text-slate-500 truncate mt-0.5">{hotline.status}</div>
              </div>
            ))}
          </div>

          <div className="p-2 rounded bg-indigo-950/40 border border-indigo-900/60 flex items-center justify-between text-[10px] text-indigo-200">
            <span className="flex items-center gap-1.5 font-medium">
              <Radio className="w-3 h-3 text-emerald-400" />
              State Toll-Free: <strong>1070</strong> | District Control: <strong>1077</strong>
            </span>
            <span className="text-emerald-400 font-mono">Toll-Free 24x7</span>
          </div>
        </div>
      </div>
    </div>
  );
};
