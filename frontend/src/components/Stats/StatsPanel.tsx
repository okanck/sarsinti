import { TrendingUp, Activity, MapPin, Calendar } from 'lucide-react';
import type { EarthquakeStats } from '../../types/earthquake';
import { formatNumber, formatDate } from '../../utils/helpers';

interface StatsPanelProps {
  stats: EarthquakeStats | null;
  loading: boolean;
}

export default function StatsPanel({ stats, loading }: StatsPanelProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-8 bg-gray-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      icon: Activity,
      label: 'Toplam Deprem',
      value: formatNumber(stats.total),
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: TrendingUp,
      label: 'En Büyük',
      value: stats.magnitude.maxMagnitude.toFixed(1),
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      icon: MapPin,
      label: 'Ort. Büyüklük',
      value: stats.magnitude.avgMagnitude.toFixed(2),
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      icon: Calendar,
      label: 'Ort. Derinlik',
      value: `${stats.magnitude.avgDepth.toFixed(1)} km`,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <div key={index} className="card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <stat.icon className={stat.color} size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Date Range */}
      {stats.dateRange && (
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Veri Aralığı</p>
              <p className="text-base font-semibold text-gray-900">
                {formatDate(stats.dateRange.oldest)} - {formatDate(stats.dateRange.newest)}
              </p>
            </div>
            <Calendar className="text-gray-400" size={32} />
          </div>
        </div>
      )}
    </div>
  );
}
