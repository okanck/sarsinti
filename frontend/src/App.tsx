import { useEffect, useState } from 'react';
import EarthquakeMap from './components/Map/EarthquakeMap';
import StatsPanel from './components/Stats/StatsPanel';
import FilterPanel from './components/Filters/FilterPanel';
import EarthquakeList from './components/EarthquakeList/EarthquakeList';
import FullscreenHint from './components/Map/FullscreenHint';
import { useEarthquakeStore } from './store/useEarthquakeStore';

function formatTimeDiff(date: Date): string {
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diff < 60) return `${diff} saniye önce`;
  if (diff < 3600) return `${Math.floor(diff / 60)} dakika önce`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} saat önce`;
  return `${Math.floor(diff / 86400)} gün önce`;
}

function App() {
  const {
    earthquakes,
    stats,
    selectedEarthquake,
    filters,
    loading,
    error,
    lastUpdateTime,
    fetchEarthquakes,
    fetchStats,
    fetchLastUpdate,
    setFilters,
    selectEarthquake,
    clearError,
  } = useEarthquakeStore();

  const [showList, setShowList] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHint, setShowHint] = useState(true);

  useEffect(() => {
    fetchEarthquakes();
    fetchStats();
    fetchLastUpdate();
  }, [fetchEarthquakes, fetchStats, fetchLastUpdate]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchEarthquakes();
      fetchStats();
      fetchLastUpdate();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchEarthquakes, fetchStats, fetchLastUpdate]);

  const handleRefresh = () => {
    fetchEarthquakes();
    fetchStats();
    fetchLastUpdate();
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    setShowHint(false);
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isFullscreen]);

  return (
    <>
      {isFullscreen && (
        <div className="fixed inset-0 z-[9999] bg-black animate-fade-in">
          <div className="absolute top-4 right-4 z-[10001] flex items-center gap-2">
            <FilterPanel
              filters={filters}
              onFiltersChange={setFilters}
              earthquakeCount={earthquakes.length}
            />
            <button
              onClick={toggleFullscreen}
              className="btn-secondary flex items-center gap-2 shadow-lg"
              title="Fullscreen'den Çık (ESC)"
            >
              Çıkış
            </button>
          </div>

          <div className="w-full h-full">
            <EarthquakeMap
              earthquakes={earthquakes}
              selectedEarthquake={selectedEarthquake}
              onEarthquakeSelect={selectEarthquake}
              selectedFaultLineId={filters.faultLineId}
              onDoubleClick={toggleFullscreen}
              isFullscreen={true}
            />
          </div>

          <div className="absolute bottom-4 right-4 z-[10001] bg-white/95 backdrop-blur-sm rounded-lg shadow-lg px-4 py-3 border border-gray-200">
            <p className="text-base font-bold text-gray-900">
              {earthquakes.length} Deprem Gösteriliyor
            </p>
            <p className="text-xs text-gray-500 mt-1">
              ESC veya Çift Tıklayarak Çıkın
            </p>
          </div>
        </div>
      )}

      <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 ${isFullscreen ? 'hidden' : ''}`}>
      <header className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-red-500 to-red-700 p-3 rounded-xl shadow-lg">
                <div className="text-white text-2xl font-bold">S</div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Sarsıntı</h1>
                <p className="text-sm text-gray-600">Türkiye Deprem İzleme Haritası</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <FilterPanel
                filters={filters}
                onFiltersChange={setFilters}
                earthquakeCount={earthquakes.length}
              />
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="btn-secondary flex items-center gap-2"
              >
                <span className={loading ? 'animate-spin' : ''}>↻</span>
                Yenile
              </button>
              <button
                onClick={() => setShowList(!showList)}
                className="btn-secondary lg:hidden"
              >
                {showList ? 'Harita' : 'Liste'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {error && (
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <div className="text-red-600 flex-shrink-0 font-bold">!</div>
            <div className="flex-1">
              <p className="text-red-800 font-medium">Hata Oluştu</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
            <button
              onClick={clearError}
              className="text-red-600 hover:text-red-800"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <StatsPanel stats={stats} loading={loading} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className={`lg:col-span-2 ${showList ? 'hidden lg:block' : ''}`}>
              <div className="bg-white rounded-lg shadow-lg p-4 h-[600px] relative group">
                <EarthquakeMap
                  earthquakes={earthquakes}
                  selectedEarthquake={selectedEarthquake}
                  onEarthquakeSelect={selectEarthquake}
                  selectedFaultLineId={filters.faultLineId}
                  onDoubleClick={toggleFullscreen}
                  isFullscreen={false}
                />
                
                <button
                  onClick={toggleFullscreen}
                  className="absolute top-6 right-6 z-[1001] bg-white/90 hover:bg-white backdrop-blur-sm rounded-lg shadow-lg p-2 transition-all opacity-0 group-hover:opacity-100"
                  title="Tam Ekran (Çift Tıklama)"
                >
                  <span className="text-xl">⛶</span>
                </button>

                {showHint && <FullscreenHint />}
              </div>
            </div>

            <div className={`lg:col-span-1 ${!showList ? 'hidden lg:block' : ''}`}>
              <div className="bg-white rounded-lg shadow-lg p-4">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Son Depremler
                  {earthquakes.length > 0 && (
                    <span className="ml-2 text-sm font-normal text-gray-600">
                      ({earthquakes.length})
                    </span>
                  )}
                </h2>
                <EarthquakeList
                  earthquakes={earthquakes}
                  selectedEarthquake={selectedEarthquake}
                  onEarthquakeSelect={selectEarthquake}
                  loading={loading}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600 text-center md:text-left">
              <p className="mb-1">
                Veri Kaynağı: <a href="https://deprem.afad.gov.tr" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:text-red-700 font-medium">AFAD</a>
              </p>
              <p className="text-xs text-gray-500">
                {lastUpdateTime ? (
                  <>Son güncelleme: {formatTimeDiff(lastUpdateTime)}</>
                ) : (
                  <>Veriler her saat başı AFAD veritabanından güncellenmektedir.</>
                )}
              </p>
            </div>
            <p className="text-sm text-gray-500">
              © 2025 Sarsıntı
            </p>
          </div>
        </div>
      </footer>
      </div>
    </>
  );
}

export default App;
