# Sarsıntı

Türkiye deprem verilerini gerçek zamanlı olarak izleyebileceğiniz web uygulaması. AFAD API'sinden saatlik olarak deprem verileri çekilerek MongoDB'de saklanır ve harita üzerinde görselleştirilir.

## Özellikler

- Türkiye geneli deprem haritası
- Büyüklük ve tarih bazlı filtreleme
- Fay hatları görselleştirmesi
- Tam ekran harita modu
- Otomatik veri güncelleme (her saat başı)
- Responsive tasarım

## Teknolojiler

**Backend:**
- Node.js + Express
- MongoDB Atlas
- AFAD API entegrasyonu
- Node-cron ile zamanlanmış görevler

**Frontend:**
- React + TypeScript + Vite
- Tailwind CSS
- Leaflet harita kütüphanesi
- Zustand state yönetimi

## Kurulum

### Gereksinimler

- Node.js 18 veya üzeri
- Docker ve Docker Compose
- MongoDB Atlas hesabı

### Yerel Geliştirme

1. Repoyu klonlayın:
```bash
git clone https://github.com/okanck/sarsinti.git
cd sarsinti
```

2. Docker ile başlatın:
```bash
docker-compose up -d
```

3. Backend şu adreste çalışacaktır: http://localhost:3000
4. Frontend şu adreste çalışacaktır: http://localhost:5173

### MongoDB Yedekten Geri Yükleme

Eğer daha önceden yedeklenmiş deprem veriniz varsa:

```bash
docker-compose exec mongodb mongorestore --db sarsinti /backup
```

## Deployment

Backend Render.com üzerinde, frontend Vercel üzerinde çalışacak şekilde yapılandırılmıştır. Detaylı deployment talimatları için `DEPLOYMENT.md` ve `VERCEL_DEPLOYMENT.md` dosyalarına bakınız.

## API Endpoints

**Genel Endpoints:**
- `GET /api/earthquakes` - Tüm depremler (filtreleme destekli)
- `GET /api/earthquakes/recent` - Son 24 saatteki depremler
- `GET /api/earthquakes/stats` - İstatistikler
- `GET /api/earthquakes/:id` - Tek deprem detayı

**Admin Endpoints:**
- `POST /api/admin/etl/trigger` - Manuel ETL çalıştırma
- `POST /api/admin/etl/reset` - ETL metadata sıfırlama
- `DELETE /api/admin/earthquakes/all` - Tüm verileri silme

Admin endpoint'leri için `X-Admin-Secret` header'ı gereklidir.

## Veri Güncelleme

Uygulama her saat başı AFAD API'sinden yeni deprem verilerini otomatik olarak çeker. ETL servisi son güncelleme tarihinden itibaren yeni verileri kontrol eder ve veritabanına ekler.

## Lisans

Bu proje kişisel kullanım içindir.
