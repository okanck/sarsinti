import axios from 'axios';
import type { Earthquake, EarthquakeStats, EarthquakeFilters, ApiResponse } from '../types/earthquake';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

export const earthquakeApi = {
  // Tüm depremleri getir
  async getEarthquakes(filters: EarthquakeFilters = {}) {
    const { data } = await api.get<ApiResponse<Earthquake[]>>('/earthquakes', {
      params: {
        ...filters,
        sort: '-date',
      },
    });
    return data;
  },

  // Son 24 saatteki depremler
  async getRecentEarthquakes() {
    const { data } = await api.get<ApiResponse<Earthquake[]>>('/earthquakes/recent');
    return data;
  },

  // İstatistikler
  async getStats() {
    const { data } = await api.get<ApiResponse<EarthquakeStats>>('/earthquakes/stats');
    return data;
  },

  // Yakın depremler
  async getNearbyEarthquakes(latitude: number, longitude: number, maxDistance: number = 100) {
    const { data } = await api.get<ApiResponse<Earthquake[]>>('/earthquakes/near', {
      params: { latitude, longitude, maxDistance },
    });
    return data;
  },

  // Tek deprem detayı
  async getEarthquake(id: string) {
    const { data } = await api.get<ApiResponse<Earthquake>>(`/earthquakes/${id}`);
    return data;
  },

  // ETL durumu
  async getEtlStatus() {
    const { data } = await api.get('/earthquakes/etl-status');
    return data;
  },
};

export default api;
