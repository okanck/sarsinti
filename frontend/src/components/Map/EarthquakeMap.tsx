import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, Polyline } from 'react-leaflet';
import { LatLngBoundsExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Earthquake } from '../../types/earthquake';
import { getMagnitudeColor, getMagnitudeSize, formatDate, getMagnitudeCategory } from '../../utils/helpers';
import { FAULT_LINES } from '../../data/faultLines';

interface EarthquakeMapProps {
  earthquakes: Earthquake[];
  selectedEarthquake: Earthquake | null;
  onEarthquakeSelect: (earthquake: Earthquake) => void;
  selectedFaultLineId?: string;
  onDoubleClick?: () => void;
  isFullscreen?: boolean;
}

// Türkiye merkez koordinatı
const TURKEY_CENTER: [number, number] = [39.0, 35.0];

// Map controller component
function MapController({ earthquakes, selectedEarthquake }: { earthquakes: Earthquake[], selectedEarthquake: Earthquake | null }) {
  const map = useMap();
  const hasZoomedRef = useRef(false);

  useEffect(() => {
    if (selectedEarthquake) {
      // Seçili depreme odaklan - daha yakın zoom
      map.flyTo(
        [selectedEarthquake.latitude, selectedEarthquake.longitude], 
        11, // Daha yakın zoom
        {
          duration: 1.0, // Daha hızlı animasyon
          easeLinearity: 0.25
        }
      );
    }
  }, [selectedEarthquake, map]);

  useEffect(() => {
    // İlk yüklemede tüm depremleri göster
    if (earthquakes.length > 0 && !hasZoomedRef.current) {
      const bounds = earthquakes.map(eq => [eq.latitude, eq.longitude] as [number, number]);
      if (bounds.length > 0) {
        map.fitBounds(bounds, { 
          padding: [80, 80], 
          maxZoom: 7,
          animate: true,
          duration: 1.5
        });
        hasZoomedRef.current = true;
      }
    }
  }, [earthquakes, map]);

  return null;
}

export default function EarthquakeMap({ earthquakes, selectedEarthquake, onEarthquakeSelect, selectedFaultLineId, onDoubleClick, isFullscreen = false }: EarthquakeMapProps) {
  const mapRef = useRef(null);

  // Depremleri büyüklüğe göre sırala (küçükten büyüğe)
  // Böylece büyük depremler en son çizilir ve üstte görünür
  const sortedEarthquakes = [...earthquakes].sort((a, b) => a.magnitude - b.magnitude);

  return (
    <div 
      className="relative w-full h-full rounded-lg overflow-hidden shadow-xl"
      onDoubleClick={onDoubleClick}
      style={{ cursor: 'grab' }}
    >
      <MapContainer
        center={TURKEY_CENTER}
        zoom={6}
        minZoom={5}
        maxZoom={15}
        ref={mapRef}
        className="w-full h-full"
        zoomControl={true}
        scrollWheelZoom={true}
        doubleClickZoom={false}
        dragging={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Fay Hatları */}
        {FAULT_LINES.map((faultLine) => {
          const isSelected = selectedFaultLineId === faultLine.id;
          const shouldShow = !selectedFaultLineId || isSelected;
          
          if (!shouldShow) return null;
          
          return (
            <Polyline
              key={faultLine.id}
              positions={faultLine.coordinates}
              pathOptions={{
                color: faultLine.color,
                weight: isSelected ? 4 : 2,
                opacity: isSelected ? 0.9 : 0.5,
                dashArray: isSelected ? undefined : '5, 10',
              }}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <h3 className="font-bold text-gray-900 mb-1">
                    {faultLine.name}
                  </h3>
                  <p className="text-sm text-gray-600">{faultLine.description}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Buffer: ±{faultLine.bufferKm} km
                  </p>
                </div>
              </Popup>
            </Polyline>
          );
        })}
        
        {sortedEarthquakes.map((earthquake) => {
          const isSelected = selectedEarthquake?._id === earthquake._id;
          // Büyük depremlere daha yüksek z-index
          const zIndexOffset = Math.floor(earthquake.magnitude * 100);
          
          return (
            <CircleMarker
              key={earthquake._id}
              center={[earthquake.latitude, earthquake.longitude]}
              radius={getMagnitudeSize(earthquake.magnitude)}
              pathOptions={{
                color: isSelected ? '#ffffff' : getMagnitudeColor(earthquake.magnitude),
                fillColor: getMagnitudeColor(earthquake.magnitude),
                fillOpacity: isSelected ? 0.95 : (earthquake.magnitude >= 4 ? 0.8 : 0.6),
                weight: isSelected ? 3 : (earthquake.magnitude >= 4 ? 2 : 1),
                opacity: 1,
              }}
              // @ts-ignore - Leaflet internal property
              style={{ zIndex: zIndexOffset }}
              eventHandlers={{
                click: () => onEarthquakeSelect(earthquake),
                mouseover: (e) => {
                  const layer = e.target;
                  layer.setStyle({
                    fillOpacity: 0.9,
                    weight: 3,
                  });
                },
                mouseout: (e) => {
                  if (!isSelected) {
                    const layer = e.target;
                    layer.setStyle({
                      fillOpacity: 0.7,
                      weight: 2,
                    });
                  }
                },
              }}
            >
            <Popup 
              closeButton={true}
              autoClose={false}
              closeOnClick={false}
              className="custom-popup"
            >
              <div className="p-0 min-w-[280px] max-w-[320px]">
                {/* Header - Compact gradient */}
                <div 
                  className="px-3 py-2 rounded-t-lg"
                  style={{ 
                    background: `linear-gradient(135deg, ${getMagnitudeColor(earthquake.magnitude)} 0%, ${getMagnitudeColor(earthquake.magnitude)}dd 100%)`,
                  }}
                >
                  <div className="flex items-center gap-2 text-white">
                    <div className="flex items-center justify-center bg-white/20 backdrop-blur-sm rounded px-2 py-1 min-w-[50px]">
                      <span className="text-xl font-bold">{earthquake.magnitude.toFixed(1)}</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-xs opacity-90 font-medium">{earthquake.magnitudeType} • {getMagnitudeCategory(earthquake.magnitude)}</div>
                    </div>
                  </div>
                </div>

                {/* Location - Compact */}
                <div className="px-3 py-2 bg-gray-50">
                  <p className="font-semibold text-gray-900 text-sm leading-tight">{earthquake.locationName}</p>
                </div>
                
                {/* Details - Single column for compactness */}
                <div className="px-3 py-2 space-y-1.5 bg-white text-xs">
                  {/* Date */}
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">📅</span>
                    <span className="text-gray-900 font-medium">{formatDate(earthquake.date)}</span>
                  </div>
                  
                  {/* Depth */}
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">⬇️</span>
                    <span className="text-gray-900 font-medium">Derinlik: {earthquake.depth.toFixed(1)} km</span>
                  </div>
                  
                  {/* Coordinates */}
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">📍</span>
                    <span className="text-gray-900 font-mono text-[11px]">
                      {earthquake.latitude.toFixed(3)}°, {earthquake.longitude.toFixed(3)}°
                    </span>
                  </div>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        )}
        )}

        <MapController earthquakes={earthquakes} selectedEarthquake={selectedEarthquake} />
      </MapContainer>

      {/* Legend - Her zaman göster */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 z-[1000] border border-gray-200">
        <h4 className="text-sm font-bold text-gray-800 mb-3">Büyüklük</h4>
        <div className="space-y-2">
          {[
            { label: '< 3.0', color: getMagnitudeColor(2.5), size: 6 },
            { label: '3.0 - 4.0', color: getMagnitudeColor(3.5), size: 8 },
            { label: '4.0 - 5.0', color: getMagnitudeColor(4.5), size: 10 },
            { label: '5.0 - 6.0', color: getMagnitudeColor(5.5), size: 12 },
            { label: '≥ 6.0', color: getMagnitudeColor(6.5), size: 14 },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3 text-xs">
              <div
                className="rounded-full shadow-sm"
                style={{ 
                  backgroundColor: item.color,
                  width: item.size,
                  height: item.size,
                  minWidth: item.size,
                  minHeight: item.size
                }}
              />
              <span className="text-gray-700 font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Info Box - Sadece normal modda göster */}
      {!isFullscreen && (
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg px-4 py-2 z-[1000] border border-gray-200">
          <p className="text-sm font-semibold text-gray-800">
            {earthquakes.length} Deprem
          </p>
        </div>
      )}
    </div>
  );
}
