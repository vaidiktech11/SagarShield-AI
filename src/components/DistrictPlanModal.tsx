import React from 'react';
import { X, Sparkles, AlertTriangle, ShieldCheck, Download, Zap, Route, Clock } from 'lucide-react';

interface DistrictPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  planData: any;
  cycloneName: string;
}

export const DistrictPlanModal: React.FC<DistrictPlanModalProps> = ({
  isOpen,
  onClose,
  planData,
  cycloneName,
}) => {
  if (!isOpen || !planData) return null;

  const downloadSOP = () => {
    const textContent = `SAGARSHIELD AI - ANTICIPATORY DISASTER RESILIENCE DIRECTIVE
==============================================================
Cyclone: ${cycloneName}
Generated: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
Authority: District Disaster Management Authority (DDMA) & State EOC

EXECUTIVE SUMMARY:
${planData.executiveSummary}

PHYSICAL TERRAIN CHOKE POINTS (PRE-LANDFALL CORRIDOR CUTOFFS):
${(planData.chokePoints || []).map((cp: string, i: number) => `${i + 1}. ${cp}`).join('\n')}

POWER GRID ISOLATION DIRECTIVES:
${(planData.powerGridDirectives || []).map((d: string, i: number) => `${i + 1}. ${d}`).join('\n')}

EVACUATION DEADLINE:
${planData.evacuationDeadline}

HIGH RISK PANCHAYATS:
${(planData.highRiskPanchayats || []).join(', ')}

==============================================================
Powered by Google Earth Engine Copernicus 30m DEM + Gemini 3.7 Flash`;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SagarShield_SOP_${cycloneName.replace(/\s+/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {planData.title || 'Anticipatory Disaster Directive'}
              </h3>
              <p className="text-xs text-slate-400">
                Synthesized by Gemini 3.7 / 3.8 Flash • {cycloneName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={downloadSOP}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-cyan-300 border border-cyan-800/80 flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export SOP (TXT)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Executive Summary */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider mb-1.5">
              Situation Assessment & Landfall Freeboard
            </div>
            <p className="text-slate-200 text-sm leading-relaxed">
              {planData.executiveSummary}
            </p>
          </div>

          {/* Terrain Choke Points */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Route className="w-4 h-4 text-amber-400" />
              Identified Terrain Choke Points (6-12h Pre-Landfall Severance)
            </div>
            <div className="space-y-1.5">
              {(planData.chokePoints || []).map((cp: string, idx: number) => (
                <div key={idx} className="flex items-start gap-2 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 text-slate-300">
                  <span className="font-mono text-amber-400 font-bold text-[11px] mt-0.5">0{idx + 1}.</span>
                  <span>{cp}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Power Grid Directives */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="text-[11px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-rose-400" />
              Power Grid Isolation & Saltwater Arc Prevention
            </div>
            <div className="space-y-1.5">
              {(planData.powerGridDirectives || []).map((dir: string, idx: number) => (
                <div key={idx} className="flex items-start gap-2 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 text-slate-300">
                  <span className="font-mono text-rose-400 font-bold text-[11px] mt-0.5">0{idx + 1}.</span>
                  <span>{dir}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Evacuation & Panchayats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 mb-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                Mandatory Evacuation Deadline
              </div>
              <div className="text-base font-bold text-white font-mono">
                {planData.evacuationDeadline || '19:30 IST (T-4h)'}
              </div>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Vulnerable Coastal Gram Panchayats
              </div>
              <div className="text-xs text-emerald-300 font-medium">
                {(planData.highRiskPanchayats || ['Dhamra', 'Talchua', 'Kaitha', 'Chandnipal']).join(', ')}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <span>Source: {planData.source || 'Gemini 3.7 / 3.8 Flash Spatial Reasoning Engine'}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
