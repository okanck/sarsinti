export interface FaultLine {
  id: string;
  name: string;
  description: string;
  color: string;
  coordinates: [number, number][]; // [latitude, longitude]
  bufferKm: number; // Fay hattına uzaklık toleransı
}

export const FAULT_LINES: FaultLine[] = [
  {
    id: 'kafh',
    name: 'Kuzey Anadolu Fay Hattı',
    description: 'Türkiye\'nin en aktif fay hattı',
    color: '#dc2626',
    bufferKm: 50,
    coordinates: [
      [40.7500, 26.5000], // Saros Körfezi
      [40.7700, 27.2000],
      [40.8000, 28.0000],
      [40.8500, 29.0000],
      [40.9000, 30.0000],
      [40.9500, 30.5000], // İstanbul
      [40.8500, 31.0000],
      [40.8000, 31.5000],
      [40.7500, 32.0000],
      [40.7000, 32.5000],
      [40.6500, 33.0000],
      [40.5500, 33.5000],
      [40.5000, 34.0000],
      [40.4000, 35.0000], // Sivas civarı
      [40.3000, 36.0000],
      [40.2000, 37.0000],
      [40.1000, 38.0000],
      [40.0000, 39.0000],
      [39.9000, 40.0000],
      [39.8000, 41.0000],
      [39.7000, 42.0000], // Karlıova
    ]
  },
  {
    id: 'dafh',
    name: 'Doğu Anadolu Fay Hattı',
    description: 'Karlıova\'dan Antakya\'ya uzanan fay',
    color: '#ea580c',
    bufferKm: 50,
    coordinates: [
      [39.7000, 42.0000], // Karlıova
      [39.5000, 41.5000],
      [39.3000, 41.0000],
      [39.1000, 40.5000],
      [38.9000, 40.0000],
      [38.7000, 39.5000],
      [38.5000, 39.0000], // Malatya
      [38.3000, 38.5000],
      [38.1000, 38.0000],
      [37.9000, 37.5000],
      [37.7000, 37.0000], // Kahramanmaraş
      [37.4000, 36.5000],
      [37.2000, 36.3000],
      [36.9000, 36.1000], // İskenderun Körfezi
      [36.5000, 36.0000], // Antakya
    ]
  },
  {
    id: 'bati-anadolu',
    name: 'Batı Anadolu Grabenleri',
    description: 'Ege Bölgesi fay sistemleri',
    color: '#f59e0b',
    bufferKm: 40,
    coordinates: [
      [38.5000, 27.0000], // İzmir
      [38.4000, 27.3000],
      [38.2000, 27.8000],
      [38.0000, 28.2000],
      [37.9000, 28.5000],
      [37.8000, 28.8000],
      [37.7000, 29.1000], // Denizli
      [37.6000, 29.4000],
      [37.5000, 29.7000],
      [37.4000, 30.0000],
      [37.3000, 30.3000], // Burdur
    ]
  },
  {
    id: 'olu-deniz',
    name: 'Ölü Deniz Fay Hattı',
    description: 'Güney sınırlar boyunca uzanan fay',
    color: '#ef4444',
    bufferKm: 40,
    coordinates: [
      [36.5000, 36.0000], // Antakya
      [36.2000, 35.9000],
      [35.9000, 35.8000],
      [35.6000, 35.7000],
    ]
  },
  {
    id: 'ege-ada',
    name: 'Ege Adaları Fay Zonu',
    description: 'Yunanistan sınırındaki faylar',
    color: '#f97316',
    bufferKm: 50,
    coordinates: [
      [39.5000, 26.0000],
      [39.0000, 26.5000],
      [38.5000, 27.0000],
      [38.0000, 27.5000],
      [37.5000, 27.8000],
      [37.0000, 28.0000],
      [36.5000, 28.2000],
    ]
  },
  {
    id: 'tuz-golu',
    name: 'Tuz Gölü Fay Zonu',
    description: 'İç Anadolu fay sistemi',
    color: '#eab308',
    bufferKm: 40,
    coordinates: [
      [39.5000, 33.0000],
      [39.2000, 33.3000],
      [38.9000, 33.6000],
      [38.6000, 33.9000],
      [38.3000, 34.2000],
      [38.0000, 34.5000],
    ]
  },
];

/**
 * Bir noktanın bir çizgiye olan minimum mesafesini hesaplar (km)
 */
export function distanceToLine(
  point: [number, number],
  line: [number, number][]
): number {
  let minDistance = Infinity;

  for (let i = 0; i < line.length - 1; i++) {
    const segmentDistance = pointToSegmentDistance(
      point,
      line[i],
      line[i + 1]
    );
    minDistance = Math.min(minDistance, segmentDistance);
  }

  return minDistance;
}

/**
 * Bir noktanın bir çizgi parçasına olan mesafesini hesaplar
 */
function pointToSegmentDistance(
  point: [number, number],
  segmentStart: [number, number],
  segmentEnd: [number, number]
): number {
  const [lat, lon] = point;
  const [lat1, lon1] = segmentStart;
  const [lat2, lon2] = segmentEnd;

  // Segment'in uzunluğu
  const segmentLength = haversineDistance(lat1, lon1, lat2, lon2);
  
  if (segmentLength === 0) {
    return haversineDistance(lat, lon, lat1, lon1);
  }

  // Nokta'nın segment üzerindeki projeksiyon parametresi
  const t = Math.max(
    0,
    Math.min(
      1,
      ((lat - lat1) * (lat2 - lat1) + (lon - lon1) * (lon2 - lon1)) /
        (segmentLength * segmentLength)
    )
  );

  // Projeksiyon noktası
  const projLat = lat1 + t * (lat2 - lat1);
  const projLon = lon1 + t * (lon2 - lon1);

  return haversineDistance(lat, lon, projLat, projLon);
}

/**
 * Haversine formülü ile iki nokta arası mesafe (km)
 */
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Dünya'nın yarıçapı (km)
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Depremin bir fay hattına yakın olup olmadığını kontrol eder
 */
export function isNearFaultLine(
  earthquake: { latitude: number; longitude: number },
  faultLine: FaultLine
): boolean {
  const distance = distanceToLine(
    [earthquake.latitude, earthquake.longitude],
    faultLine.coordinates
  );
  
  return distance <= faultLine.bufferKm;
}
