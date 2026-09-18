import React from 'react';
import { InfrastructureAsset, CycloneTrackPoint } from '../types';
import { 
  AlertOctagon, 
  ZapOff, 
  Route, 
  ShieldCheck, 
  Waves, 
  Users, 
  Sparkles,
  ArrowUpRight
} from 'lucide-react';

interface StatsBarProps {
  assets: InfrastructureAsset[];
  currentTrackPoint: CycloneTrackPoint;
  onSynthesizePlan: () => void;
  loadingPlan: boolean;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  assets,
  currentTrackPoint,
  onSynthesizePlan,
  loadingPlan,
}) => {
  const currentSurge = currentTrackPoint.surgeHeightMeters;

  const submergedAssets = assets.filter((a) => a.elevationMeters <= currentSurge);
  const criticalMarginAssets = assets.filter(
    (a) => a.elevationMeters > currentSurge && a.elevationMeters - currentSurge <= 0.6
  );
  const severedRoads = assets.filter(
    (a) => a.category === 'road' && a.elevationMeters <= currentSurge
  );
  const threatenedSubstations = assets.filter(
    (a) => a.category === 'substation' && a.elevationMeters <= currentSurge + 0.5
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {/* Metric 1: Inundation Risk Assets */}
      <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-400 flex items-center justify-center shrink-0">
          <AlertOctagon className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[11px] text-slate-400 font-medium">Submerged Assets</div>
          <div className="text-xl font-black text-rose-400 font-mono">
            {submergedAssets.length} <span className="text-xs text-slate-500 font-normal">/ {assets.length}</span>
          </div>
          <div className="text-[10px] text-slate-500">Water &gt; Elevation</div>
        </div>
      </div>

      {/* Metric 2: Power Grid Feeder Risks */}
      <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-amber-950/80 border border-amber-800 text-amber-400 flex items-center justify-center shrink-0">
          <ZapOff className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[11px] text-slate-400 font-medium">Substation Flashover</div>
          <div className="text-xl font-black text-amber-400 font-mono">
            {threatenedSubstations.length} <span className="text-xs text-slate-500 font-normal">High Risk</span>
          </div>
          <div className="text-[10px] text-slate-500">Saltwater Arc Hazard</div>
        </div>
      </div>

      {/* Metric 3: Cut-Off Evacuation Corridors */}
      <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-indigo-950/80 border border-indigo-800 text-indigo-400 flex items-center justify-center shrink-0">
          <Route className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[11px] text-slate-400 font-medium">Corridors Cut Off</div>
          <div className="text-xl font-black text-indigo-400 font-mono">
            {severedRoads.length} <span className="text-xs text-slate-500 font-normal">Routes</span>
          </div>
          <div className="text-[10px] text-slate-500">6-12h Pre-Landfall</div>
        </div>
      </div>

      {/* Metric 4: Peak Surge Runup */}
      <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-cyan-950/80 border border-cyan-800 text-cyan-400 flex items-center justify-center shrink-0">
          <Waves className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[11px] text-slate-400 font-medium">Peak Surge Runup</div>
          <div className="text-xl font-black text-cyan-400 font-mono">
            +{currentSurge.toFixed(1)}m
          </div>
          <div className="text-[10px] text-slate-500">Tidal Superposition</div>
        </div>
      </div>

      {/* Synthesize Action Plan Button (Col 5) */}
      <div className="col-span-2 md:col-span-1 bg-gradient-to-br from-cyan-950 via-slate-900 to-blue-950 border border-cyan-700/60 p-3 rounded-xl flex flex-col justify-center">
        <button
          onClick={onSynthesizePlan}
          disabled={loadingPlan}
          className="w-full h-full py-1.5 px-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-cyan-600/30 transition-all disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{loadingPlan ? 'Synthesizing...' : 'Synthesize District Plan'}</span>
        </button>
        <span className="text-[10px] text-cyan-300/80 text-center mt-1 font-mono">
          Gemini 3.7 Anticipatory Action
        </span>
      </div>
    </div>
  );
};
