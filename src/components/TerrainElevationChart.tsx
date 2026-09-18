import React from 'react';
import { CycloneTrackPoint, InfrastructureAsset } from '../types';
import { Waves, Mountain, ShieldAlert } from 'lucide-react';

interface TerrainElevationChartProps {
  currentTrackPoint: CycloneTrackPoint;
  assets: InfrastructureAsset[];
  selectedAsset: InfrastructureAsset | null;
  onSelectAsset: (asset: InfrastructureAsset) => void;
}

export const TerrainElevationChart: React.FC<TerrainElevationChartProps> = ({
  currentTrackPoint,
  assets,
  selectedAsset,
  onSelectAsset,
}) => {
  const currentSurge = currentTrackPoint.surgeHeightMeters;

  // Cross-sectional points from Ocean (-2km) to Inland (+14km)
  const profilePoints = [
    { km: -2, elev: -5.0, label: 'Bay of Bengal Deep' },
    { km: 0, elev: 0.0, label: 'Shoreline / Intertidal' },
    { km: 1.5, elev: 1.4, label: 'Talchua Causeway', assetId: 'asset-road-talchua' },
    { km: 3.0, elev: 1.8, label: 'Dhamra PHC', assetId: 'asset-dhamra-coastal-phc' },
    { km: 4.5, elev: 2.1, label: 'Dhamra Port 132kV', assetId: 'asset-dhamra-substation' },
    { km: 6.0, elev: 2.3, label: 'SH-9 Highway Culvert', assetId: 'asset-road-sh9' },
    { km: 8.5, elev: 3.4, label: 'Chandnipal Shelter', assetId: 'asset-chandnipal-shelter' },
    { km: 11.0, elev: 4.8, label: 'Basudevpur CHC', assetId: 'asset-basudevpur-chc' },
    { km: 14.0, elev: 6.2, label: 'Inland High Plateau' },
  ];

  const maxElev = 7.0;
  const minElev = -2.0;
  const heightSpan = maxElev - minElev;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl text-slate-100">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-3 border-b border-slate-800">
        <div>
          <h3 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
            <Mountain className="w-3.5 h-3.5 text-cyan-400" />
            Copernicus 30m DEM Cross-Section & Surge Over-Topping Profile
          </h3>
          <p className="text-[11px] text-slate-400">
            Shoreline to Inland elevation profile showing water breach across critical coastal assets
          </p>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1 text-rose-400 font-mono font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            Surge Runup Level: +{currentSurge.toFixed(1)}m
          </span>
          <span className="flex items-center gap-1 text-cyan-400 font-mono">
            <span className="w-2.5 h-2.5 rounded bg-cyan-600" />
            Terrain Elevation
          </span>
        </div>
      </div>

      {/* SVG Canvas for Cross Section */}
      <div className="relative w-full h-48 bg-slate-950/90 rounded-lg p-2 overflow-hidden border border-slate-800">
        <svg viewBox="0 0 800 200" className="w-full h-full preserve-3d" preserveAspectRatio="none">
          <defs>
            <linearGradient id="terrainGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0891b2" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.6" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1="50" y1="160" x2="780" y2="160" stroke="#334155" strokeWidth="1" strokeDasharray="4,4" />
          <text x="15" y="163" fill="#64748b" fontSize="10" fontFamily="monospace">0.0m</text>

          <line x1="50" y1="110" x2="780" y2="110" stroke="#334155" strokeWidth="1" strokeDasharray="4,4" />
          <text x="15" y="113" fill="#64748b" fontSize="10" fontFamily="monospace">+2.5m</text>

          <line x1="50" y1="60" x2="780" y2="60" stroke="#334155" strokeWidth="1" strokeDasharray="4,4" />
          <text x="15" y="63" fill="#64748b" fontSize="10" fontFamily="monospace">+5.0m</text>

          {/* Surge Water Fill (Dynamic water plane) */}
          {/* Y calculation: 160 is 0.0m; 50 is 5.5m; scale is 20px per meter */}
          {(() => {
            const surgeY = 160 - currentSurge * 20;
            return (
              <g>
                <rect x="50" y={Math.max(10, surgeY)} width="730" height={Math.max(0, 160 - surgeY)} fill="url(#waterGrad)" />
                <line x1="50" y1={surgeY} x2="780" y2={surgeY} stroke="#f43f5e" strokeWidth="2.5" strokeDasharray="6,4" />
                <text x="680" y={surgeY - 6} fill="#fda4af" fontSize="11" fontWeight="bold" fontFamily="monospace">
                  SURGE +{currentSurge.toFixed(1)}m
                </text>
              </g>
            );
          })()}

          {/* Ground Terrain Polygon */}
          {(() => {
            const coords = profilePoints.map((pt) => {
              const x = 70 + ((pt.km + 2) / 16) * 690;
              const y = 160 - pt.elev * 20;
              return `${x},${y}`;
            });
            const polyPoints = `70,195 ${coords.join(' ')} 760,195`;
            return (
              <polygon points={polyPoints} fill="url(#terrainGrad)" stroke="#38bdf8" strokeWidth="2" />
            );
          })()}

          {/* Asset Markers on Profile */}
          {profilePoints.map((pt, idx) => {
            if (!pt.assetId) return null;
            const x = 70 + ((pt.km + 2) / 16) * 690;
            const y = 160 - pt.elev * 20;
            const surgeY = 160 - currentSurge * 20;
            const isFlooded = pt.elev < currentSurge;
            const isSelected = selectedAsset?.id === pt.assetId;

            return (
              <g key={idx} className="cursor-pointer" onClick={() => {
                const a = assets.find(item => item.id === pt.assetId);
                if (a) onSelectAsset(a);
              }}>
                <circle
                  cx={x}
                  cy={y}
                  r={isSelected ? 7 : 5}
                  fill={isFlooded ? '#ef4444' : '#10b981'}
                  stroke="#ffffff"
                  strokeWidth="2"
                />
                <line x1={x} y1={y} x2={x} y2={y - 25} stroke={isFlooded ? '#f87171' : '#6ee7b7'} strokeWidth="1" />
                <text
                  x={x}
                  y={y - 28}
                  textAnchor="middle"
                  fill={isSelected ? '#38bdf8' : '#e2e8f0'}
                  fontSize="9.5"
                  fontWeight="bold"
                >
                  {pt.label} ({pt.elev}m)
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
        <span>← Bay of Bengal Coast (0km)</span>
        <span className="text-amber-400 font-medium">Notice: Talchua (1.4m), Dhamra (2.1m) and SH-9 (2.3m) breach first</span>
        <span>Inland High Plateau (+14km) →</span>
      </div>
    </div>
  );
};
