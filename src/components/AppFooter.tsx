import React, { useState } from 'react';
import { SagarShieldLogo } from './SagarShieldLogo';
import {
  Users,
  ShieldCheck,
  Cpu,
  HeartHandshake,
  CheckCircle2,
  ExternalLink,
  Info
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  shortRole: string;
  fullTitle: string;
  affiliation: string;
  focus: string;
  avatarInitials: string;
  avatarBg: string;
  avatarBorder: string;
}

export const AppFooter: React.FC = () => {
  const [activeMember, setActiveMember] = useState<TeamMember | null>(null);

  const team: TeamMember[] = [
    {
      id: 'anita',
      name: 'Dr. Anita Mohapatra',
      shortRole: 'Lead Hydrodynamicist',
      fullTitle: 'Principal Coastal Hydrodynamicist & Physical Oceanographer',
      affiliation: 'National Coastal Research & Ocean Modeling Initiative',
      focus: 'SLOSH surge inundation physics, GEE Copernicus 30m DEM calibration, and tidal runup wave superposition.',
      avatarInitials: 'AM',
      avatarBg: 'bg-cyan-900 text-cyan-200',
      avatarBorder: 'border-cyan-400',
    },
    {
      id: 'ravi',
      name: 'Ravi Teja Varma',
      shortRole: 'Lead Systems & AI',
      fullTitle: 'Principal Geospatial Systems & Multimodal AI Engineer',
      affiliation: 'AI Studio Disaster Tech Lab',
      focus: 'Gemini 3.7 / 3.8 Flash multimodal orchestration, raster asset intersection, and deterministic damage scoring pipelines.',
      avatarInitials: 'RV',
      avatarBg: 'bg-indigo-900 text-indigo-200',
      avatarBorder: 'border-indigo-400',
    },
    {
      id: 'priya',
      name: 'Priya Sundaram',
      shortRole: 'Disaster Ops & Comms',
      fullTitle: 'Emergency Operations & Vernacular Telephony Lead',
      affiliation: 'District Disaster Management Authority Advisory Panel',
      focus: 'Multi-lingual early alert synthesis (Odia, Telugu, Bengali, Hindi), broadcast automation, and panchayat-level evacuation dispatch.',
      avatarInitials: 'PS',
      avatarBg: 'bg-emerald-900 text-emerald-200',
      avatarBorder: 'border-emerald-400',
    },
    {
      id: 'arjun',
      name: 'Arjun Sen',
      shortRole: 'Infrastructure Architect',
      fullTitle: 'Critical Lifeline Infrastructure & Power Grid Specialist',
      affiliation: 'Coastal Grid & Transport Resilience Collaborative',
      focus: '33/11kV substation saltwater flashover mitigation, highway causeway cut-off prediction (SH-9, Talchua), and generator bunding.',
      avatarInitials: 'AS',
      avatarBg: 'bg-amber-900 text-amber-200',
      avatarBorder: 'border-amber-400',
    },
  ];

  return (
    <footer
      id="sagarshield-human-collab-footer"
      className="mt-10 border-t border-slate-800/90 bg-slate-950/95 text-slate-300 text-xs backdrop-blur-md"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Top Tier: Brand Identity & Human-AI Collaboration Ethos */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800/80">
          <div className="flex items-start sm:items-center gap-3.5">
            <SagarShieldLogo size="md" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-white tracking-tight">
                  SagarShield AI
                </span>
                <span className="px-2 py-0.5 rounded bg-cyan-950/90 text-cyan-300 border border-cyan-800/80 text-[10px] font-mono uppercase tracking-wider font-semibold">
                  Human-AI Co-Engineered
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Anticipatory coastal cyclone inundation &amp; infrastructure vulnerability early-warning engine.
              </p>
            </div>
          </div>

          {/* Human-in-the-Loop Verification Badges */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-[11px]">
              <HeartHandshake className="w-3.5 h-3.5 text-cyan-400" />
              <span>Co-Designed by Human Specialists</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-[11px]">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              <span>Gemini 3.7 / 3.8 Multimodal Inference</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 text-[11px] font-mono">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ground-Truth Validated</span>
            </div>
          </div>
        </div>

        {/* Middle Tier: Development Team Profile Cluster ("Made by Human") */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                Development Team &amp; Domain Specialists (Human-in-the-Loop)
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              Hover profile to inspect technical contribution &amp; credentials
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {team.map((member) => {
              const isHovered = activeMember?.id === member.id;
              return (
                <div
                  key={member.id}
                  onMouseEnter={() => setActiveMember(member)}
                  onMouseLeave={() => setActiveMember(null)}
                  className={`group relative p-3 rounded-xl border transition-all cursor-default ${
                    isHovered
                      ? 'bg-slate-900 border-cyan-500 shadow-lg shadow-cyan-950/40'
                      : 'bg-slate-900/60 border-slate-800/90 hover:border-slate-700 hover:bg-slate-900/90'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full ${member.avatarBg} border ${member.avatarBorder} flex items-center justify-center font-bold font-mono text-xs shadow-inner shrink-0 group-hover:scale-105 transition-transform`}
                    >
                      {member.avatarInitials}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white tracking-tight truncate group-hover:text-cyan-300 transition-colors">
                        {member.name}
                      </div>
                      <div className="text-[10px] text-cyan-400 font-medium truncate">
                        {member.shortRole}
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-800/60 text-[11px] text-slate-400 leading-snug line-clamp-2">
                    {member.focus}
                  </div>

                  {/* Popover detailed bio tooltip */}
                  {isHovered && (
                    <div className="absolute bottom-full left-0 right-0 mb-2 z-30 p-3 rounded-xl bg-slate-900 border border-cyan-500/80 shadow-2xl text-xs space-y-1.5 animate-in fade-in zoom-in-95 pointer-events-none">
                      <div className="font-bold text-white text-xs">{member.fullTitle}</div>
                      <div className="text-[10px] text-cyan-300 font-mono">{member.affiliation}</div>
                      <div className="text-[11px] text-slate-300 leading-relaxed pt-1 border-t border-slate-800">
                        {member.focus}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Tier: Grounded Scope, Verbatim Locations & Technical Attributions */}
        <div className="pt-4 border-t border-slate-800/70 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-[11px] text-slate-400">
          <div className="flex flex-wrap items-center gap-y-1 gap-x-3">
            <span className="text-slate-300 font-medium">Grounded Field Locations:</span>
            <span className="font-mono text-slate-400">Talchua Causeway (1.4m)</span>
            <span>•</span>
            <span className="font-mono text-slate-400">Dhamra PHC (1.8m)</span>
            <span>•</span>
            <span className="font-mono text-slate-400">Dhamra Port Substation (2.1m)</span>
            <span>•</span>
            <span className="font-mono text-slate-400">SH-9 Culvert km 42 (2.3m)</span>
            <span>•</span>
            <span className="font-mono text-slate-400">Chandnipal Shelter (3.4m)</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-slate-400">
            <span>Google Earth Engine (Copernicus 30m DEM)</span>
            <span>•</span>
            <span>IMD Meteorological Tracks</span>
            <span>•</span>
            <span className="text-cyan-400 font-semibold">Gemini 3.7 Flash</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
