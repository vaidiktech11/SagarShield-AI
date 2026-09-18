import React, { useState } from 'react';
import { CYCLONE_PRESETS, COASTAL_ASSETS } from './data/mockData';
import { CycloneProfile, InfrastructureAsset } from './types';
import { Header } from './components/Header';
import { TimelineScrubber } from './components/TimelineScrubber';
import { RiskCanvasMap } from './components/RiskCanvasMap';
import { AssetInspector } from './components/AssetInspector';
import { TerrainElevationChart } from './components/TerrainElevationChart';
import { VernacularDispatcher } from './components/VernacularDispatcher';
import { PitchDeckModal } from './components/PitchDeckModal';
import { DistrictPlanModal } from './components/DistrictPlanModal';
import { SituationStatusPanel } from './components/SituationStatusPanel';
import { AppFooter } from './components/AppFooter';
import { 
  Layers, 
  Activity, 
  Radio, 
  Sparkles, 
  Info,
  ShieldAlert,
  MapPin,
  ExternalLink
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'canvas' | 'audit' | 'dispatcher' | 'deck'>('canvas');
  const [selectedCyclone, setSelectedCyclone] = useState<CycloneProfile>(CYCLONE_PRESETS[0]);
  const [currentStepIndex, setCurrentStepIndex] = useState(3); // Defaults to T-6h (Pre-Landfall peak surge window)
  const [isPlaying, setIsPlaying] = useState(false);
  const [assets, setAssets] = useState<InfrastructureAsset[]>(COASTAL_ASSETS);
  const [selectedAsset, setSelectedAsset] = useState<InfrastructureAsset | null>(COASTAL_ASSETS[0]);
  
  // Modals
  const [isDeckOpen, setIsDeckOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [planData, setPlanData] = useState<any>(null);

  const currentTrackPoint = selectedCyclone.track[currentStepIndex] || selectedCyclone.track[0];

  // Synthesize District Anticipatory Plan with Gemini
  const handleSynthesizePlan = async () => {
    setLoadingPlan(true);
    try {
      const res = await fetch('/api/synthesize-district-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cyclone: selectedCyclone,
          timeOffsetHours: currentTrackPoint.timeOffsetHours,
          assets,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setPlanData(data);
        setIsPlanModalOpen(true);
      }
    } catch (e) {
      console.error('Failed to synthesize plan:', e);
    } finally {
      setLoadingPlan(false);
    }
  };

  const handleTriggerVernacularDispatch = (asset: InfrastructureAsset) => {
    setSelectedAsset(asset);
    setActiveTab('dispatcher');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Header with Bespoke SagarShield Emblem */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedCyclone={selectedCyclone}
        setSelectedCyclone={(cyclone) => {
          setSelectedCyclone(cyclone);
          setCurrentStepIndex(Math.min(currentStepIndex, cyclone.track.length - 1));
        }}
        onOpenDeck={() => setIsDeckOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-5">
        {/* Dedicated Situation Status Panel (Metrics, EOC Hotline, Critical Alert) */}
        <SituationStatusPanel
          assets={assets}
          currentTrackPoint={currentTrackPoint}
          cycloneName={selectedCyclone.name}
          cycloneState={selectedCyclone.state}
          onSynthesizePlan={handleSynthesizePlan}
          loadingPlan={loadingPlan}
        />

        {/* Global Timeline Scrubber (Active across all tabs) */}
        <TimelineScrubber
          cyclone={selectedCyclone}
          currentStepIndex={currentStepIndex}
          setCurrentStepIndex={setCurrentStepIndex}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          currentTrackPoint={currentTrackPoint}
        />

        {/* Tab 1: Module A - Dynamic Risk Canvas */}
        {activeTab === 'canvas' && (
          <div className="flex flex-col gap-5">
            {/* Split layout: GIS Map (Left 65%) + Asset Quick Inspector (Right 35%) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <div className="lg:col-span-8 flex flex-col gap-4">
                <RiskCanvasMap
                  cyclone={selectedCyclone}
                  currentTrackPoint={currentTrackPoint}
                  assets={assets}
                  selectedAsset={selectedAsset}
                  onSelectAsset={setSelectedAsset}
                />
              </div>

              <div className="lg:col-span-4 flex flex-col">
                <AssetInspector
                  asset={selectedAsset}
                  cyclone={selectedCyclone}
                  currentTrackPoint={currentTrackPoint}
                  onTriggerVernacularDispatch={handleTriggerVernacularDispatch}
                />
              </div>
            </div>

            {/* Cross-sectional Copernicus 30m DEM Elevation Profile */}
            <TerrainElevationChart
              currentTrackPoint={currentTrackPoint}
              assets={assets}
              selectedAsset={selectedAsset}
              onSelectAsset={setSelectedAsset}
            />
          </div>
        )}

        {/* Tab 2: Module B - Deep Asset Vulnerability Assessment */}
        {activeTab === 'audit' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Asset Selector Sidebar */}
            <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col gap-3 max-h-[750px] overflow-y-auto">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  Coastal Assets ({assets.length})
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Select to Audit</span>
              </div>

              <div className="space-y-2">
                {assets.map((asset) => {
                  const currentSurge = currentTrackPoint.surgeHeightMeters;
                  const delta = asset.elevationMeters - currentSurge;
                  const isFlooded = delta < 0;
                  const isCritical = !isFlooded && delta <= 0.6;
                  const isSelected = selectedAsset?.id === asset.id;

                  return (
                    <button
                      key={asset.id}
                      onClick={() => setSelectedAsset(asset)}
                      className={`w-full text-left p-3 rounded-lg border transition-all text-xs flex flex-col gap-1 ${
                        isSelected
                          ? 'bg-cyan-950/60 border-cyan-500 shadow-md shadow-cyan-950'
                          : 'bg-slate-950/50 border-slate-800/80 hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white tracking-tight">{asset.name}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase font-mono ${
                          isFlooded
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : isCritical
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}>
                          {isFlooded ? `-${Math.abs(delta).toFixed(1)}m` : `+${delta.toFixed(1)}m`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="capitalize">{asset.category} • {asset.district}</span>
                        <span className="font-mono text-cyan-300">DEM: {asset.elevationMeters}m</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Asset Audit Inspector */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              <AssetInspector
                asset={selectedAsset}
                cyclone={selectedCyclone}
                currentTrackPoint={currentTrackPoint}
                onTriggerVernacularDispatch={handleTriggerVernacularDispatch}
              />

              <TerrainElevationChart
                currentTrackPoint={currentTrackPoint}
                assets={assets}
                selectedAsset={selectedAsset}
                onSelectAsset={setSelectedAsset}
              />
            </div>
          </div>
        )}

        {/* Tab 3: Module C - Vernacular Alert Dispatcher */}
        {activeTab === 'dispatcher' && (
          <VernacularDispatcher
            cyclone={selectedCyclone}
            assets={assets}
            selectedAsset={selectedAsset}
          />
        )}
      </main>

      {/* Human-in-the-Loop Development Team Footer ("Made by Human") */}
      <AppFooter />

      {/* 12-Slide Pitch Deck Modal */}
      <PitchDeckModal
        isOpen={isDeckOpen}
        onClose={() => setIsDeckOpen(false)}
      />

      {/* Synthesized District Plan Modal */}
      <DistrictPlanModal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        planData={planData}
        cycloneName={selectedCyclone.name}
      />
    </div>
  );
}
