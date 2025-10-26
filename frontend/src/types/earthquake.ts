export interface Earthquake {
  _id: string;
  eventId: string;
  date: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  locationName: string;
  magnitude: number;
  depth: number;
  magnitudeType: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  updatedAt: string;
}

export interface EarthquakeStats {
  total: number;
  dateRange: {
    oldest: string;
    newest: string;
  };
  magnitude: {
    avgMagnitude: number;
    maxMagnitude: number;
    minMagnitude: number;
    avgDepth: number;
  };
  distribution: Array<{
    _id: number;
    count: number;
  }>;
}

export interface EarthquakeFilters {
  minMagnitude?: number;
  startDate?: string;
  endDate?: string;
  limit?: number;
  page?: number;
  faultLineId?: string; // Fay hattı filtresi
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}
