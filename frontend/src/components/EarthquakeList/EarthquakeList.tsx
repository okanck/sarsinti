import { AlertCircle, MapPin, Clock } from 'lucide-react';
import type { Earthquake } from '../../types/earthquake';
import { formatRelativeDate, getMagnitudeColor, getMagnitudeCategory } from '../../utils/helpers';

interface EarthquakeListProps {
  earthquakes: Earthquake[];
  selectedEarthquake: Earthquake | null;
  onEarthquakeSelect: (earthquake: Earthquake) => void;
  loading: boolean;
}

export default function EarthquakeList({ 
  earthquakes, 
  selectedEarthquake, 
  onEarthquakeSelect,
  loading 
}: EarthquakeListProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="card animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (earthquakes.length === 0) {
    return (
      <div className="card text-center py-12">
        <AlertCircle className="mx-auto mb-4 text-gray-400" size={48} />
        <p className="text-gray-600">Gösterilecek deprem bulunamadı.</p>
        <p className="text-sm text-gray-500 mt-2">Filtreleri değiştirmeyi deneyin.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
      {earthquakes.slice(0, 50).map((earthquake) => (
        <button
          key={earthquake._id}
          onClick={() => onEarthquakeSelect(earthquake)}
          className={`w-full text-left card transition-all duration-200 ${
            selectedEarthquake?._id === earthquake._id
              ? 'ring-2 ring-red-500 shadow-lg'
              : 'hover:shadow-md'
          }`}
        >
          <div className="flex items-start gap-3">
            {/* Magnitude Circle */}
            <div
              className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-md"
              style={{ backgroundColor: getMagnitudeColor(earthquake.magnitude) }}
            >
              {earthquake.magnitude.toFixed(1)}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-semibold text-gray-900 truncate">
                  {earthquake.locationName}
                </h3>
                <span className={`flex-shrink-0 px-2 py-0.5 text-xs font-medium rounded ${
                  earthquake.magnitude >= 5 ? 'bg-red-100 text-red-700' :
                  earthquake.magnitude >= 4 ? 'bg-orange-100 text-orange-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {getMagnitudeCategory(earthquake.magnitude)}
                </span>
              </div>

              <div className="space-y-0.5 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  <span>{formatRelativeDate(earthquake.date)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin size={14} />
                  <span>Derinlik: {earthquake.depth.toFixed(1)} km</span>
                </div>
              </div>
            </div>
          </div>
        </button>
      ))}

      {earthquakes.length > 50 && (
        <div className="card text-center py-4 bg-gray-50">
          <p className="text-sm text-gray-600">
            İlk 50 deprem gösteriliyor. Daha fazlası için filtreleri kullanın.
          </p>
        </div>
      )}
    </div>
  );
}
