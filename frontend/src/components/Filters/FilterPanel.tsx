import { useState } from 'react';
import { Filter, X, Zap } from 'lucide-react';
import type { EarthquakeFilters } from '../../types/earthquake';
import { FAULT_LINES } from '../../data/faultLines';

interface FilterPanelProps {
  filters: EarthquakeFilters;
  onFiltersChange: (filters: Partial<EarthquakeFilters>) => void;
  earthquakeCount: number;
}

export default function FilterPanel({ filters, onFiltersChange, earthquakeCount }: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleReset = () => {
    onFiltersChange({
      minMagnitude: undefined,
      startDate: undefined,
      endDate: undefined,
      faultLineId: undefined,
    });
  };

  const hasActiveFilters = filters.minMagnitude || filters.startDate || filters.endDate || filters.faultLineId;

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-primary flex items-center gap-2 relative shadow-lg"
      >
        <Filter size={18} />
        Filtreler
        {hasActiveFilters && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
        )}
      </button>

      {/* Filter Panel */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white/95 backdrop-blur-sm rounded-lg shadow-2xl border border-gray-200 p-4 z-[1002] animate-fade-in max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Filtreler</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            {/* Fay Hattı Filtresi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Zap size={16} className="text-red-600" />
                Fay Hattı
              </label>
              <select
                value={filters.faultLineId || ''}
                onChange={(e) => onFiltersChange({ faultLineId: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
              >
                <option value="">Tüm Fay Hatları</option>
                {FAULT_LINES.map((faultLine) => (
                  <option key={faultLine.id} value={faultLine.id}>
                    {faultLine.name}
                  </option>
                ))}
              </select>
              {filters.faultLineId && (
                <p className="mt-1 text-xs text-gray-500">
                  {FAULT_LINES.find(fl => fl.id === filters.faultLineId)?.description}
                </p>
              )}
            </div>

            {/* Minimum Magnitude */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Büyüklük: {filters.minMagnitude?.toFixed(1) || '0.0'}
              </label>
              <input
                type="range"
                min="0"
                max="8"
                step="0.1"
                value={filters.minMagnitude || 0}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  onFiltersChange({ minMagnitude: value > 0 ? value : undefined });
                }}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0.0</span>
                <span>8.0</span>
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Başlangıç Tarihi
              </label>
              <input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => onFiltersChange({ startDate: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bitiş Tarihi
              </label>
              <input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => onFiltersChange({ endDate: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Quick Filters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hızlı Filtreler
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    const today = new Date();
                    const yesterday = new Date(today);
                    yesterday.setDate(yesterday.getDate() - 1);
                    onFiltersChange({
                      startDate: yesterday.toISOString().split('T')[0],
                      endDate: today.toISOString().split('T')[0],
                    });
                  }}
                  className="btn-secondary text-xs"
                >
                  Son 24 Saat
                </button>
                <button
                  onClick={() => {
                    const today = new Date();
                    const weekAgo = new Date(today);
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    onFiltersChange({
                      startDate: weekAgo.toISOString().split('T')[0],
                      endDate: today.toISOString().split('T')[0],
                    });
                  }}
                  className="btn-secondary text-xs"
                >
                  Son 7 Gün
                </button>
                <button
                  onClick={() => {
                    const today = new Date();
                    const monthAgo = new Date(today);
                    monthAgo.setMonth(monthAgo.getMonth() - 1);
                    onFiltersChange({
                      startDate: monthAgo.toISOString().split('T')[0],
                      endDate: today.toISOString().split('T')[0],
                    });
                  }}
                  className="btn-secondary text-xs"
                >
                  Son 30 Gün
                </button>
                <button
                  onClick={() => onFiltersChange({ minMagnitude: 4.0 })}
                  className="btn-secondary text-xs"
                >
                  ≥ 4.0 Büyüklük
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {earthquakeCount} deprem
            </span>
            {hasActiveFilters && (
              <button
                onClick={handleReset}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Filtreleri Temizle
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
