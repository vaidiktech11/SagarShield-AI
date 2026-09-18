import React, { useState } from 'react';
import { 
  InfrastructureAsset, 
  CycloneProfile, 
  CycloneTrackPoint, 
  AssetRiskAssessment 
} from '../types';
import { 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Zap, 
  Hospital, 
  Route, 
  Home, 
  Anchor,
  Clock,
  ArrowRight,
  TrendingUp,
  Cpu,
  RefreshCw,
  BellRing
} from 'lucide-react';

interface AssetInspectorProps {
  asset: InfrastructureAsset | null;
  cyclone: CycloneProfile;
  currentTrackPoint: CycloneTrackPoint;
  onClose?: () => void;
  onTriggerVernacularDispatch?: (asset: InfrastructureAsset) => void;
}

export const AssetInspector: React.FC<AssetInspectorProps> = ({
  asset,
  cyclone,
  currentTrackPoint,
  onClose,
  onTriggerVernacularDispatch,
}) => {
  const [loadingAI, setLoadingAI] = useState(false);
  const [assessment, setAssessment] = useState<AssetRiskAssessment | null>(null);
  const [checkedHardening, setCheckedHardening] = useState<Record<string, boolean>>({});

  if (!asset) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 text-center text-slate-400 h-full flex flex-col items-center justify-center min-h-[420px]">
        <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-300 mb-3 shadow-inner">
          <ShieldCheck className="w-7 h-7 text-cyan-400" />
        </div>
        <h3 className="text-base font-bold text-slate-200">No Infrastructure Node Selected</h3>
        <p className="text-xs text-slate-400 max-w-sm mt-1">
          Select any critical power substation, coastal health centre, or evacuation causeway on the Dynamic Risk Canvas to run a hyper-local Gemini 3.7 vulnerability audit.
        </p>
      </div>
    );
  }

  const elevation = asset.elevationMeters;
  const currentSurge = currentTrackPoint.surgeHeightMeters;
  const surgeDelta = Number((elevation - currentSurge).toFixed(2));
  const isFlooded = surgeDelta < 0;

  // Run or re-run live Gemini 3.7 / 3.8 Flash audit
  const runGeminiAudit = async () => {
    setLoadingAI(true);
    try {
      const res = await fetch('/api/assess-asset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          asset,
          cyclone,
          currentWaterLevel: currentSurge,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAssessment(data);
      }
    } catch (err) {
      console.error('Failed to run Gemini assessment:', err);
    } finally {
      setLoadingAI(false);
    }
  };

  // Toggle hardening checklist state
  const toggleMeasure = (measure: string) => {
    setCheckedHardening((prev) => ({
      ...prev,
      [measure]: !prev[measure],
    }));
  };

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-xl p-5 shadow-2xl text-slate-100 flex flex-col gap-4">
      {/* Asset Header */}
      <div className="flex items-start justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl border ${
            isFlooded
              ? 'bg-rose-950/80 border-rose-700 text-rose-300'
              : surgeDelta <= 0.6
              ? 'bg-amber-950/80 border-amber-700 text-amber-300'
              : 'bg-emerald-950/80 border-emerald-700 text-emerald-300'
          }`}>
            {asset.category === 'substation' && <Zap className="w-6 h-6" />}
            {asset.category === 'hospital' && <Hospital className="w-6 h-6" />}
            {asset.category === 'road' && <Route className="w-6 h-6" />}
            {asset.category === 'shelter' && <Home className="w-6 h-6" />}
            {asset.category === 'port' && <Anchor className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">{asset.name}</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                {asset.category}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {asset.panchayat}, {asset.district} District, {asset.state}
            </p>
          </div>
        </div>

        <button
          onClick={runGeminiAudit}
          disabled={loadingAI}
          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-cyan-600/20 transition-all disabled:opacity-50"
        >
          {loadingAI ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-200" />
              <span>Synthesizing...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
              <span>Run Gemini 3.7 Audit</span>
            </>
          )}
        </button>
      </div>

      {/* Module B Requirements: Elevation vs Surge Delta */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Copernicus DEM Elevation */}
        <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-lg">
          <div className="text-[11px] text-slate-400 font-medium">Copernicus 30m DEM Elevation</div>
          <div className="text-xl font-black text-cyan-400 font-mono mt-0.5">
            {elevation.toFixed(1)}m <span className="text-xs font-normal text-slate-400">MSL</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Satellite Synthetic Aperture Radar</div>
        </div>

        {/* Estimated Storm Surge Runup */}
        <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-lg">
          <div className="text-[11px] text-slate-400 font-medium">Simulated Peak Surge Runup</div>
          <div className="text-xl font-black text-rose-400 font-mono mt-0.5">
            +{currentSurge.toFixed(1)}m <span className="text-xs font-normal text-slate-400">MSL</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Astronomical Tide + 120km/h Wind Setup</div>
        </div>

        {/* Surge Delta (The Critical Metric) */}
        <div className={`p-3 rounded-lg border ${
          isFlooded
            ? 'bg-rose-950/50 border-rose-700/80'
            : surgeDelta <= 0.6
            ? 'bg-amber-950/50 border-amber-700/80'
            : 'bg-emerald-950/50 border-emerald-700/80'
        }`}>
          <div className="text-[11px] font-medium text-slate-300">Elevation vs. Surge Delta</div>
          <div className="text-xl font-black font-mono mt-0.5 flex items-center gap-1.5">
            <span className={isFlooded ? 'text-rose-400' : surgeDelta <= 0.6 ? 'text-amber-400' : 'text-emerald-400'}>
              {surgeDelta > 0 ? `+${surgeDelta.toFixed(1)}m` : `${surgeDelta.toFixed(1)}m`}
            </span>
            <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
              isFlooded ? 'bg-rose-900 text-rose-200' : surgeDelta <= 0.6 ? 'bg-amber-900 text-amber-200' : 'bg-emerald-900 text-emerald-200'
            }`}>
              {isFlooded ? 'Inundated' : surgeDelta <= 0.6 ? 'Critical' : 'Safe Freeboard'}
            </span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {isFlooded ? `Overtopped by ${Math.abs(surgeDelta).toFixed(1)}m water column` : `Freeboard clearance margin`}
          </div>
        </div>
      </div>

      {/* Visual Water Level Gauge Comparison */}
      <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3">
        <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5 font-medium">
          <span>Terrain Inundation Water-Level Gauge</span>
          <span className="font-mono text-cyan-400 text-[11px]">Zero Datum: Mean Sea Level (MSL)</span>
        </div>
        <div className="relative w-full h-5 bg-slate-800 rounded-full overflow-hidden flex items-center">
          {/* Elevation Bar */}
          <div
            className="h-full bg-cyan-600/70 border-r-2 border-cyan-300 transition-all flex items-center justify-end pr-2 text-[10px] font-bold text-white"
            style={{ width: `${Math.min(100, (elevation / 7.0) * 100)}%` }}
          >
            Ground: {elevation}m
          </div>
          {/* Surge Marker line */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-rose-500 z-10 shadow-lg shadow-rose-500"
            style={{ left: `${Math.min(100, (currentSurge / 7.0) * 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
          <span>0.0m (Coastline)</span>
          <span>Surge Water: +{currentSurge.toFixed(1)}m (Red Line)</span>
          <span>7.0m (Safe Inland Ridge)</span>
        </div>
      </div>

      {/* AI Vulnerability Score & Priority Badge */}
      <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-lg flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="text-center pr-3 border-r border-slate-800">
            <div className="text-[10px] text-slate-400 font-mono">VULNERABILITY INDEX</div>
            <div className="text-2xl font-black text-rose-400 font-mono">
              {assessment?.vulnerabilityScore || asset.baselineVulnerability} <span className="text-xs text-slate-500">/ 10</span>
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-300">Action Priority:</div>
            <div className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
              <span className={`h-2.5 w-2.5 rounded-full ${isFlooded ? 'bg-rose-500 animate-ping' : 'bg-amber-400'}`} />
              <span className={isFlooded ? 'text-rose-400' : 'text-amber-400'}>
                {assessment?.priorityLevel || (isFlooded ? 'P0 - Immediate Evacuate & Hardening' : 'P1 - Deploy Perimeter Defenses')}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="text-[10px] text-slate-400">Recommended Evacuation Lead</div>
            <div className="text-xs font-bold text-white font-mono flex items-center gap-1 justify-end">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>{assessment?.recommendedEvacuationTimeHours || (isFlooded ? 6 : 3)} Hours Prior to Landfall</span>
            </div>
          </div>
        </div>
      </div>

      {/* Operational Impact Audit */}
      <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-lg space-y-2">
        <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          Operational Impact & Choke-Point Analysis
        </h4>
        <p className="text-xs text-slate-300 leading-relaxed">
          {assessment?.operationalImpact || (
            isFlooded
              ? `Water column will over-top the site by ${Math.abs(surgeDelta).toFixed(1)}m. At 132/33kV, saltwater flooding will cause terminal phase flashover, tripping coastal transformers. Access route (SH-9 / Talchua) will be severed 6 hours prior to eye landfall, stranding ambulances.`
              : `Terrain currently retains a +${surgeDelta.toFixed(1)}m freeboard margin above peak surge. Heavy precipitation and coastal wave spray could breach perimeter drains. Immediate sandbag staging advised.`
          )}
        </p>

        {/* Impact chips */}
        <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
          <span className="px-2 py-1 rounded bg-slate-900 border border-slate-700/80 text-slate-300 flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" />
            Grid Outage: <strong className={isFlooded ? 'text-rose-400' : 'text-amber-300'}>{isFlooded ? 'Imminent' : 'High Risk'}</strong>
          </span>
          <span className="px-2 py-1 rounded bg-slate-900 border border-slate-700/80 text-slate-300 flex items-center gap-1">
            <Route className="w-3 h-3 text-indigo-400" />
            Corridor Access: <strong className={isFlooded ? 'text-rose-400' : 'text-emerald-300'}>{isFlooded ? 'Severed by T-6h' : 'Passable with Warning'}</strong>
          </span>
          <span className="px-2 py-1 rounded bg-slate-900 border border-slate-700/80 text-slate-300 flex items-center gap-1">
            <Cpu className="w-3 h-3 text-cyan-400" />
            Generator Telemetry: <strong className="text-cyan-300">{asset.backupPowerAvailable ? 'Online (Aux Genset)' : 'No Backup Staged'}</strong>
          </span>
        </div>
      </div>

      {/* Tactical Hardening Measures Checklist */}
      <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-lg space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Tactical Hardening Measures (Anticipatory SOP)
          </h4>
          <span className="text-[10px] text-slate-400 font-mono">
            {Object.values(checkedHardening).filter(Boolean).length} Completed
          </span>
        </div>

        <div className="space-y-1.5 pt-1">
          {(assessment?.tacticalHardeningMeasures || [
            asset.category === 'substation'
              ? 'Lock out and de-energize 33kV coastal feeder by T-6h to prevent saltwater flashover'
              : 'Transfer ICU and oxygen-dependent patients to Basudevpur CHC by 18:30 IST',
            `Erect sandbag perimeter bund to elevation +${(currentSurge + 0.6).toFixed(1)}m MSL`,
            'Relocate containerized diesel generator to elevated pad (>4.5m DEM)',
            'Deploy ODRAF rubberized rescue boats at highway culvert chainage 42km'
          ]).map((measure, idx) => {
            const isChecked = Boolean(checkedHardening[measure]);
            return (
              <label
                key={idx}
                className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-colors text-xs border ${
                  isChecked
                    ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/50'
                }`}
                onClick={() => toggleMeasure(measure)}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => {}}
                  className="mt-0.5 accent-emerald-500 rounded"
                />
                <span className={isChecked ? 'line-through text-slate-400' : 'text-slate-200'}>
                  {measure}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Action Footer: Dispatch Localized Warnings */}
      <div className="pt-1 flex items-center justify-between gap-3">
        {onTriggerVernacularDispatch && (
          <button
            onClick={() => onTriggerVernacularDispatch(asset)}
            className="w-full bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-800/60 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <BellRing className="w-3.5 h-3.5 text-cyan-400" />
            <span>Generate Vernacular Alert for {asset.panchayat}</span>
          </button>
        )}
      </div>
    </div>
  );
};
