import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  CycloneProfile, 
  InfrastructureAsset, 
  CycloneTrackPoint 
} from '../types';
import { 
  Zap, 
  Hospital, 
  Home, 
  Route, 
  Anchor, 
  Layers, 
  Eye, 
  AlertTriangle,
  Info
} from 'lucide-react';

interface RiskCanvasMapProps {
  cyclone: CycloneProfile;
  currentTrackPoint: CycloneTrackPoint;
  assets: InfrastructureAsset[];
  selectedAsset: InfrastructureAsset | null;
  onSelectAsset: (asset: InfrastructureAsset) => void;
}

export const RiskCanvasMap: React.FC<RiskCanvasMapProps> = ({
  cyclone,
  currentTrackPoint,
  assets,
  selectedAsset,
  onSelectAsset,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersRef = useRef<{
    trackLine?: L.Polyline;
    stormEye?: L.CircleMarker;
    windRadius?: L.Circle;
    surgeFootprint?: L.Polygon | L.LayerGroup;
    demContourLayers?: L.LayerGroup;
    markersLayer?: L.LayerGroup;
  }>({});

  // Layer Visibility Toggles
  const [showDEMContours, setShowDEMContours] = useState(true);
  const [showSurgeOverlay, setShowSurgeOverlay] = useState(true);
  const [showTrack, setShowTrack] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'substation' | 'hospital' | 'road' | 'shelter'>('all');
  const [baseMapType, setBaseMapType] = useState<'dark' | 'satellite'>('dark');

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [cyclone.center.lat, cyclone.center.lng],
      zoom: cyclone.zoom,
      zoomControl: true,
      attributionControl: false,
    });

    // Add Dark Matter tile layer
    const darkTileLayer = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      {
        maxZoom: 19,
        subdomains: 'abcd',
      }
    );

    darkTileLayer.addTo(map);
    (map as any)._currentBaseLayer = darkTileLayer;

    // Add Scale bar
    L.control.scale({ position: 'bottomleft', imperial: false }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Base Layer (Dark vs Satellite)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if ((map as any)._currentBaseLayer) {
      map.removeLayer((map as any)._currentBaseLayer);
    }

    if (baseMapType === 'satellite') {
      const satLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19 }
      );
      satLayer.addTo(map);
      (map as any)._currentBaseLayer = satLayer;
    } else {
      const darkLayer = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        { maxZoom: 19, subdomains: 'abcd' }
      );
      darkLayer.addTo(map);
      (map as any)._currentBaseLayer = darkLayer;
    }
  }, [baseMapType]);

  // Recenter map on cyclone change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.setView([cyclone.center.lat, cyclone.center.lng], cyclone.zoom, { animate: true });
  }, [cyclone.id]);

  // Render Cyclone Track, Eye, & Wind Radius
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clean old track layers
    if (layersRef.current.trackLine) map.removeLayer(layersRef.current.trackLine);
    if (layersRef.current.stormEye) map.removeLayer(layersRef.current.stormEye);
    if (layersRef.current.windRadius) map.removeLayer(layersRef.current.windRadius);

    if (showTrack) {
      const latlngs: [number, number][] = cyclone.track.map((pt) => [pt.lat, pt.lng]);

      // Dashed cyclone forecast track
      const trackLine = L.polyline(latlngs, {
        color: '#f43f5e',
        weight: 3,
        dashArray: '6, 6',
        opacity: 0.85,
      }).addTo(map);

      // Current Storm Eye
      const stormEye = L.circleMarker([currentTrackPoint.lat, currentTrackPoint.lng], {
        radius: 12,
        fillColor: '#ef4444',
        color: '#ffffff',
        weight: 2.5,
        opacity: 1,
        fillOpacity: 0.9,
      }).addTo(map);

      stormEye.bindTooltip(
        `<strong>${cyclone.name}</strong><br/>Wind: ${currentTrackPoint.windSpeedKmph} km/h<br/>Surge: +${currentTrackPoint.surgeHeightMeters}m`,
        { permanent: false, direction: 'top' }
      );

      // Gale wind radius circle
      const windRadius = L.circle([currentTrackPoint.lat, currentTrackPoint.lng], {
        radius: (currentTrackPoint.radiusKm || 120) * 1000,
        color: '#f43f5e',
        weight: 1,
        fillColor: '#fb7185',
        fillOpacity: 0.08,
        dashArray: '4, 8',
      }).addTo(map);

      layersRef.current.trackLine = trackLine;
      layersRef.current.stormEye = stormEye;
      layersRef.current.windRadius = windRadius;
    }
  }, [cyclone, currentTrackPoint, showTrack]);

  // Render Google Earth Engine 30m DEM Elevation Contours & Dynamic Surge Inundation Footprint
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (layersRef.current.demContourLayers) {
      map.removeLayer(layersRef.current.demContourLayers);
    }
    if (layersRef.current.surgeFootprint) {
      map.removeLayer(layersRef.current.surgeFootprint);
    }

    const currentSurge = currentTrackPoint.surgeHeightMeters;

    // 1. DEM Elevation Contours (Simulating Copernicus 30m DEM bands along the active coastal zone)
    if (showDEMContours) {
      const demGroup = L.layerGroup();
      const center = cyclone.center;

      // Band 1: 0 - 2m Extreme coastal lowlands (Mangrove delta, mudflats, estuaries)
      const lowContour = L.polygon(
        [
          [center.lat - 0.25, center.lng + 0.12],
          [center.lat - 0.08, center.lng + 0.04],
          [center.lat + 0.04, center.lng - 0.03],
          [center.lat + 0.18, center.lng - 0.08],
          [center.lat + 0.12, center.lng + 0.15],
          [center.lat - 0.10, center.lng + 0.22],
        ],
        {
          color: '#0284c7',
          weight: 1,
          fillColor: '#0369a1',
          fillOpacity: 0.25,
          dashArray: '2, 4',
        }
      ).bindTooltip('Copernicus 30m DEM: 0.0m - 2.0m Coastal Basin (High Inundation Risk)', { sticky: true });
      demGroup.addLayer(lowContour);

      // Band 2: 2 - 4m Transition buffer (Paddy flats, coastal roads)
      const midContour = L.polygon(
        [
          [center.lat - 0.32, center.lng - 0.05],
          [center.lat - 0.15, center.lng - 0.12],
          [center.lat + 0.08, center.lng - 0.18],
          [center.lat + 0.26, center.lng - 0.22],
          [center.lat + 0.22, center.lng - 0.06],
          [center.lat + 0.05, center.lng - 0.01],
          [center.lat - 0.12, center.lng + 0.06],
        ],
        {
          color: '#eab308',
          weight: 1,
          fillColor: '#ca8a04',
          fillOpacity: 0.15,
          dashArray: '3, 5',
        }
      ).bindTooltip('Copernicus 30m DEM: 2.0m - 4.0m Transition Embankment', { sticky: true });
      demGroup.addLayer(midContour);

      // Band 3: 4 - 6m Elevated Ridges & Cyclone Shelters
      const highContour = L.polygon(
        [
          [center.lat - 0.36, center.lng - 0.20],
          [center.lat - 0.18, center.lng - 0.26],
          [center.lat + 0.12, center.lng - 0.30],
          [center.lat + 0.30, center.lng - 0.34],
          [center.lat + 0.25, center.lng - 0.22],
          [center.lat - 0.10, center.lng - 0.15],
        ],
        {
          color: '#10b981',
          weight: 1,
          fillColor: '#059669',
          fillOpacity: 0.12,
        }
      ).bindTooltip('Copernicus 30m DEM: 4.0m - 6.0m Safe Evacuation Plateau', { sticky: true });
      demGroup.addLayer(highContour);

      demGroup.addTo(map);
      layersRef.current.demContourLayers = demGroup;
    }

    // 2. Dynamic Storm Surge Inundation Footprint (scales with simulated surge height)
    if (showSurgeOverlay) {
      const center = cyclone.center;
      // Surge penetration scales inland based on surge height (e.g. 0.9m vs 4.8m)
      const penetrationFactor = Math.min(1.0, currentSurge / 5.0);
      const inlandOffset = 0.05 + penetrationFactor * 0.18;

      const surgePolygon = L.polygon(
        [
          [center.lat - 0.30, center.lng + 0.25], // Ocean approach
          [center.lat - 0.22, center.lng + 0.08 - inlandOffset * 0.4],
          [center.lat - 0.05, center.lng - inlandOffset * 0.7],
          [center.lat + 0.10, center.lng - inlandOffset * 0.85],
          [center.lat + 0.25, center.lng - inlandOffset * 0.5],
          [center.lat + 0.28, center.lng + 0.22],
        ],
        {
          color: currentSurge >= 4.0 ? '#ef4444' : currentSurge >= 2.5 ? '#f59e0b' : '#06b6d4',
          weight: 2,
          fillColor: currentSurge >= 4.0 ? '#dc2626' : currentSurge >= 2.5 ? '#d97706' : '#0891b2',
          fillOpacity: 0.35 + penetrationFactor * 0.25,
          className: 'animate-pulse',
        }
      );

      surgePolygon.bindTooltip(
        `<div class="text-xs font-sans">
          <strong class="text-rose-400">Predicted Surge Inundation Footprint</strong><br/>
          Water Level: <strong>+${currentSurge.toFixed(1)}m</strong> above MSL<br/>
          Inland Penetration: <strong>${(penetrationFactor * 8.5).toFixed(1)} km</strong><br/>
          Tide State: Astronomical Spring Tide + Wind Setup
        </div>`,
        { sticky: true }
      );

      surgePolygon.addTo(map);
      layersRef.current.surgeFootprint = surgePolygon;
    }
  }, [cyclone, currentTrackPoint.surgeHeightMeters, showDEMContours, showSurgeOverlay]);

  // Render Infrastructure Asset Pins
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (layersRef.current.markersLayer) {
      map.removeLayer(layersRef.current.markersLayer);
    }

    const markersGroup = L.layerGroup();
    const currentSurge = currentTrackPoint.surgeHeightMeters;

    const filtered = assets.filter((asset) => {
      if (categoryFilter === 'all') return true;
      return asset.category === categoryFilter;
    });

    filtered.forEach((asset) => {
      const delta = asset.elevationMeters - currentSurge;
      const isSubmerged = delta < 0;
      const isCriticalMargin = !isSubmerged && delta <= 0.6;

      // Status color
      const markerColor = isSubmerged ? '#ef4444' : isCriticalMargin ? '#f59e0b' : '#10b981';
      const statusLabel = isSubmerged
        ? `SUBMERGED (-${Math.abs(delta).toFixed(1)}m)`
        : isCriticalMargin
        ? `CRITICAL MARGIN (+${delta.toFixed(1)}m)`
        : `SAFE (+${delta.toFixed(1)}m)`;

      // Custom HTML Marker Icon
      const customIcon = L.divIcon({
        className: 'custom-asset-icon',
        html: `
          <div class="relative group cursor-pointer">
            <div class="w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 ${
              isSubmerged
                ? 'bg-rose-950 border-rose-500 text-rose-300 ring-2 ring-rose-500/40 animate-pulse'
                : isCriticalMargin
                ? 'bg-amber-950 border-amber-500 text-amber-300'
                : 'bg-emerald-950 border-emerald-500 text-emerald-300'
            } ${selectedAsset?.id === asset.id ? 'scale-125 ring-4 ring-cyan-400' : 'hover:scale-110'} transition-transform">
              <span class="text-xs font-bold">
                ${
                  asset.category === 'substation'
                    ? '⚡'
                    : asset.category === 'hospital'
                    ? '🏥'
                    : asset.category === 'road'
                    ? '🛣️'
                    : asset.category === 'shelter'
                    ? '🛡️'
                    : '⚓'
                }
              </span>
            </div>
            ${
              isSubmerged
                ? '<span class="absolute -top-1 -right-1 flex h-3 w-3"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span><span class="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span></span>'
                : ''
            }
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([asset.location.lat, asset.location.lng], { icon: customIcon });

      const popupContent = `
        <div class="p-1 min-w-[210px] text-xs font-sans">
          <div class="flex items-center justify-between pb-1.5 border-b border-slate-700 mb-1.5">
            <span class="font-bold text-white text-sm">${asset.name}</span>
          </div>
          <div class="space-y-1 text-slate-300">
            <div class="flex justify-between">
              <span class="text-slate-400">Category:</span>
              <span class="capitalize text-slate-200 font-medium">${asset.category}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Copernicus 30m Elevation:</span>
              <span class="font-mono text-cyan-300 font-bold">${asset.elevationMeters}m MSL</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Current Surge Level:</span>
              <span class="font-mono text-rose-300 font-bold">+${currentSurge.toFixed(1)}m</span>
            </div>
            <div class="flex justify-between pt-1 border-t border-slate-700/60 font-semibold">
              <span class="text-slate-300">Status:</span>
              <span class="${isSubmerged ? 'text-rose-400' : isCriticalMargin ? 'text-amber-400' : 'text-emerald-400'} font-bold">
                ${statusLabel}
              </span>
            </div>
          </div>
          <button id="inspect-btn-${asset.id}" class="mt-2.5 w-full bg-cyan-600 hover:bg-cyan-500 text-white py-1 px-2 rounded text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors">
            Run Gemini 3.7 Vulnerability Audit
          </button>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('click', () => {
        onSelectAsset(asset);
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`inspect-btn-${asset.id}`);
        if (btn) {
          btn.onclick = () => {
            onSelectAsset(asset);
          };
        }
      });

      markersGroup.addLayer(marker);
    });

    markersGroup.addTo(map);
    layersRef.current.markersLayer = markersGroup;
  }, [assets, currentTrackPoint.surgeHeightMeters, categoryFilter, selectedAsset?.id, onSelectAsset]);

  return (
    <div className="relative w-full h-[620px] rounded-xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
      {/* Map container DOM */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Tactical Layer Control Bar (Top Left) */}
      <div className="absolute top-3 left-3 z-10 bg-slate-950/90 border border-slate-800 backdrop-blur rounded-lg p-2.5 shadow-xl text-xs text-slate-200 max-w-xs space-y-2">
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
          <span className="font-bold flex items-center gap-1.5 text-cyan-400">
            <Layers className="w-3.5 h-3.5" />
            GIS Inundation Layers
          </span>
          <span className="text-[10px] text-slate-400 font-mono">GEE Copernicus 30m</span>
        </div>

        <div className="space-y-1.5">
          <label className="flex items-center justify-between cursor-pointer hover:text-white">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
              Surge Inundation Contour
            </span>
            <input
              type="checkbox"
              checked={showSurgeOverlay}
              onChange={(e) => setShowSurgeOverlay(e.target.checked)}
              className="accent-cyan-500 rounded"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer hover:text-white">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              Copernicus 30m Elevation
            </span>
            <input
              type="checkbox"
              checked={showDEMContours}
              onChange={(e) => setShowDEMContours(e.target.checked)}
              className="accent-cyan-500 rounded"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer hover:text-white">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              IMD Cyclone Track & Eye
            </span>
            <input
              type="checkbox"
              checked={showTrack}
              onChange={(e) => setShowTrack(e.target.checked)}
              className="accent-cyan-500 rounded"
            />
          </label>
        </div>

        {/* Base Map Switcher */}
        <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Map Style:</span>
          <div className="flex gap-1">
            <button
              onClick={() => setBaseMapType('dark')}
              className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                baseMapType === 'dark' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              Tactical Dark
            </button>
            <button
              onClick={() => setBaseMapType('satellite')}
              className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                baseMapType === 'satellite' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              Sentinel Satellite
            </button>
          </div>
        </div>
      </div>

      {/* Floating Asset Category Filter (Top Right) */}
      <div className="absolute top-3 right-3 z-10 bg-slate-950/90 border border-slate-800 backdrop-blur rounded-lg p-1.5 shadow-xl flex items-center gap-1 text-xs">
        <button
          onClick={() => setCategoryFilter('all')}
          className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
            categoryFilter === 'all' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          All Assets ({assets.length})
        </button>
        <button
          onClick={() => setCategoryFilter('substation')}
          className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 transition-colors ${
            categoryFilter === 'substation' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Zap className="w-3 h-3 text-amber-400" />
          Power Substations
        </button>
        <button
          onClick={() => setCategoryFilter('hospital')}
          className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 transition-colors ${
            categoryFilter === 'hospital' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Hospital className="w-3 h-3 text-rose-400" />
          Hospitals & PHCs
        </button>
        <button
          onClick={() => setCategoryFilter('road')}
          className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 transition-colors ${
            categoryFilter === 'road' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Route className="w-3 h-3 text-indigo-400" />
          Road Corridors
        </button>
        <button
          onClick={() => setCategoryFilter('shelter')}
          className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 transition-colors ${
            categoryFilter === 'shelter' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Home className="w-3 h-3 text-emerald-400" />
          Shelters
        </button>
      </div>

      {/* Floating Legend Bar (Bottom Right) */}
      <div className="absolute bottom-3 right-3 z-10 bg-slate-950/90 border border-slate-800 backdrop-blur rounded-lg p-2.5 shadow-xl text-[11px] text-slate-300 flex items-center gap-4">
        <div className="flex items-center gap-1.5 font-medium">
          <span className="w-3 h-3 rounded-full bg-rose-500 border border-rose-300 animate-pulse" />
          <span>High Inundation (Surge &gt; Elevation)</span>
        </div>
        <div className="flex items-center gap-1.5 font-medium">
          <span className="w-3 h-3 rounded-full bg-amber-400 border border-amber-200" />
          <span>Critical Margin (&lt;0.6m Freeboard)</span>
        </div>
        <div className="flex items-center gap-1.5 font-medium">
          <span className="w-3 h-3 rounded-full bg-emerald-500 border border-emerald-300" />
          <span>Stable / Elevated Ridge</span>
        </div>
      </div>
    </div>
  );
};
