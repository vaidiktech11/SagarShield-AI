import React, { useEffect } from 'react';
import { Play, Pause, RotateCcw, AlertTriangle, Wind, Gauge, Compass, Waves } from 'lucide-react';
import { CycloneProfile, CycloneTrackPoint } from '../types';

interface TimelineScrubberProps {
  cyclone: CycloneProfile;
  currentStepIndex: number;
  setCurrentStepIndex: React.Dispatch<React.SetStateAction<number>>;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  currentTrackPoint: CycloneTrackPoint;
}

export const TimelineScrubber: React.FC<TimelineScrubberProps> = ({
  cyclone,
  currentStepIndex,
  setCurrentStepIndex,
  isPlaying,
  setIsPlaying,
  currentTrackPoint,
}) => {
  // Auto-play loop
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= cyclone.track.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, cyclone.track.length, setCurrentStepIndex, setIsPlaying]);

  const isPreLandfallWindow = currentTrackPoint.timeOffsetHours <= -6 && currentTrackPoint.timeOffsetHours >= -12;
  const isLandfall = currentTrackPoint.timeOffsetHours === 0;

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-xl p-4 shadow-xl text-slate-100 backdrop-blur">
      {/* Top metrics bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`h-9 w-9 rounded-lg flex items-center justify-center transition-colors shadow ${
                isPlaying ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-cyan-600 hover:bg-cyan-500 text-white'
              }`}
              title={isPlaying ? 'Pause Simulation' : 'Auto Play Simulation'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
            <button
              onClick={() => {
                setIsPlaying(false);
                setCurrentStepIndex(0);
              }}
              className="h-9 w-9 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center border border-slate-700"
              title="Reset to T-36h"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <div>
            <div className="text-xs text-slate-400 font-mono">TIMELINE HORIZON</div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <span className="text-cyan-400">{currentTrackPoint.timeLabel}</span>
              {currentTrackPoint.timeOffsetHours === 0 && (
                <span className="px-2 py-0.5 rounded bg-rose-900/80 text-rose-300 text-[11px] font-semibold border border-rose-700 animate-pulse">
                  EYE LANDFALL
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Telemetry chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <Wind className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-400">Wind Velocity:</span>
            <span className="font-bold text-white font-mono">{currentTrackPoint.windSpeedKmph} km/h</span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <Gauge className="w-4 h-4 text-indigo-400" />
            <span className="text-slate-400">Central Pressure:</span>
            <span className="font-bold text-white font-mono">{currentTrackPoint.centralPressureHpa} hPa</span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <Waves className="w-4 h-4 text-rose-400" />
            <span className="text-slate-400">Simulated Surge Runup:</span>
            <span className="font-bold text-rose-300 font-mono text-sm">+{currentTrackPoint.surgeHeightMeters}m</span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-400">Category:</span>
            <span className="font-medium text-emerald-300">{currentTrackPoint.category}</span>
          </div>
        </div>
      </div>

      {/* Critical Challenge Callout: 6-12h pre-landfall road cut-off warning */}
      {isPreLandfallWindow && (
        <div className="mt-2.5 px-3 py-2 rounded-lg bg-amber-950/40 border border-amber-800/80 flex items-center gap-2.5 text-xs text-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 animate-bounce" />
          <div>
            <strong className="text-amber-300">CRITICAL 6-12h PRE-LANDFALL CORRIDOR SEVERANCE:</strong> Coastal roads and causeways (SH-9, Talchua) are currently overtopping 6 to 12 hours prior to eye landfall due to tidal wave runup superposition. Evacuation convoys must be dispatched before water crosses 0.5m threshold!
          </div>
        </div>
      )}

      {isLandfall && (
        <div className="mt-2.5 px-3 py-2 rounded-lg bg-rose-950/40 border border-rose-800/80 flex items-center gap-2.5 text-xs text-rose-200">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <div>
            <strong className="text-rose-300">LANDFALL ACTIVE:</strong> Maximum hydrodynamic surge runup (+{currentTrackPoint.surgeHeightMeters}m). Complete outdoor movement freeze. Switchgear isolation completed.
          </div>
        </div>
      )}

      {/* Scrubber slider track */}
      <div className="mt-3.5 pt-1">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1.5">
          {cyclone.track.map((pt, idx) => (
            <button
              key={idx}
              onClick={() => {
                setIsPlaying(false);
                setCurrentStepIndex(idx);
              }}
              className={`transition-colors cursor-pointer text-center ${
                idx === currentStepIndex
                  ? 'text-cyan-400 font-bold'
                  : 'hover:text-slate-200'
              }`}
            >
              {pt.timeOffsetHours === 0 ? 'LANDFALL (T-0)' : pt.timeOffsetHours > 0 ? `T+${pt.timeOffsetHours}h` : `T${pt.timeOffsetHours}h`}
            </button>
          ))}
        </div>

        {/* Custom Range Bar */}
        <div className="relative flex items-center">
          <input
            type="range"
            min="0"
            max={cyclone.track.length - 1}
            step="1"
            value={currentStepIndex}
            onChange={(e) => {
              setIsPlaying(false);
              setCurrentStepIndex(Number(e.target.value));
            }}
            className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
};
