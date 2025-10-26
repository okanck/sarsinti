import { Maximize2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function FullscreenHint() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // 5 saniye sonra otomatik gizle
    const timer = setTimeout(() => {
      setShow(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000] pointer-events-none animate-pulse">
      <div className="bg-black/70 backdrop-blur-sm text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
        <Maximize2 size={24} />
        <div>
          <p className="font-semibold">Tam Ekran İçin</p>
          <p className="text-sm text-gray-300">Haritaya çift tıklayın</p>
        </div>
      </div>
    </div>
  );
}
