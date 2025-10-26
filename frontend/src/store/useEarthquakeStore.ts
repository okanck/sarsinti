import { create } from 'zustand';
import type { Earthquake, EarthquakeStats, EarthquakeFilters } from '../types/earthquake';
import { earthquakeApi } from '../services/api';
import { FAULT_LINES, isNearFaultLine } from '../data/faultLines';

interface EarthquakeStore {
  // State
  earthquakes: Earthquake[];
  allEarthquakes: Earthquake[]; // Filter öncesi tüm depremler
  stats: EarthquakeStats | null;
  selectedEarthquake: Earthquake | null;
  filters: EarthquakeFilters;
  loading: boolean;
  error: string | null;
  lastUpdateTime: Date | null;
  
  // Actions
  fetchEarthquakes: () => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchLastUpdate: () => Promise<void>;
  setFilters: (filters: Partial<EarthquakeFilters>) => void;
  selectEarthquake: (earthquake: Earthquake | null) => void;
  clearError: () => void;
}

export const useEarthquakeStore = create<EarthquakeStore>((set, get) => ({
  // Initial state
  earthquakes: [],
  allEarthquakes: [],
  stats: null,
  selectedEarthquake: null,
  filters: {
    limit: 1000,
    page: 1,
  },
  loading: false,
  error: null,
  lastUpdateTime: null,

  // Fetch earthquakes
  fetchEarthquakes: async () => {
    set({ loading: true, error: null });
    try {
      const filters = get().filters;
      const { faultLineId, ...apiFilters } = filters;
      
      const response = await earthquakeApi.getEarthquakes(apiFilters);
      let earthquakes = response.data;
      
      // Fay hattı filtresi varsa uygula
      if (faultLineId) {
        const faultLine = FAULT_LINES.find(fl => fl.id === faultLineId);
        if (faultLine) {
          earthquakes = earthquakes.filter(eq => isNearFaultLine(eq, faultLine));
        }
      }
      
      set({ 
        earthquakes,
        allEarthquakes: response.data, 
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Depremler yüklenirken hata oluştu',
        loading: false 
      });
    }
  },

  // Fetch stats
  fetchStats: async () => {
    try {
      const response = await earthquakeApi.getStats();
      set({ stats: response.data });
    } catch (error) {
      console.error('Stats fetch error:', error);
    }
  },

  // Fetch last update time
  fetchLastUpdate: async () => {
    try {
      const response = await earthquakeApi.getEtlStatus();
      if (response.data?.lastRunAt) {
        set({ lastUpdateTime: new Date(response.data.lastRunAt) });
      }
    } catch (error) {
      console.error('Last update fetch error:', error);
    }
  },

  // Set filters and refetch
  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters, page: 1 }
    }));
    get().fetchEarthquakes();
  },

  // Select earthquake
  selectEarthquake: (earthquake) => {
    set({ selectedEarthquake: earthquake });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
}));
