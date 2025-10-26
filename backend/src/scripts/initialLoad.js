require('dotenv').config();
const connectDB = require('../config/database');
const etlService = require('../services/etlService');

/**
 * İlk Yükleme Script'i
 * 1960'dan bugüne kadar tüm depremleri yıl yıl çeker
 * 
 * Kullanım:
 *   npm run etl:initial
 *   node src/scripts/initialLoad.js
 */

async function initialLoad() {
  console.log('========================================');
  console.log('  📦 İLK YÜKLEME - AFAD TÜM VERİLER   ');
  console.log('========================================\n');

  try {
    await connectDB();

    const startYear = 1960;
    const currentYear = new Date().getFullYear();
    
    console.log(`📅 Yıl aralığı: ${startYear} - ${currentYear}`);
    console.log(`📊 Toplam: ${currentYear - startYear + 1} yıl\n`);

    let totalRecords = 0;
    let totalSkipped = 0;

    
    for (let year = startYear; year <= currentYear; year++) {
      const startDate = new Date(`${year}-01-01`);
      const endDate = year === currentYear 
        ? new Date() 
        : new Date(`${year}-12-31`);

      console.log(`\n${'='.repeat(50)}`);
      console.log(`📆 Yıl: ${year}`);
      console.log(`📅 ${startDate.toISOString().split('T')[0]} - ${endDate.toISOString().split('T')[0]}`);
      console.log(`${'='.repeat(50)}`);

      try {
        const result = await etlService.run({
          startDate,
          endDate
        });

        totalRecords += result.recordsAdded;
        totalSkipped += result.recordsSkipped;

        console.log(`✅ ${year} tamamlandı:`);
        console.log(`   Eklenen: ${result.recordsAdded}`);
        console.log(`   Atlanan: ${result.recordsSkipped}`);
        console.log(`   Süre: ${result.duration}s`);

      } catch (error) {
        console.error(`❌ ${year} hatası:`, error.message);
        console.log('⏭️  Sonraki yıla devam ediliyor...');
      }

      
      console.log(`⏳ Rate limit için 10 saniye bekleniyor...`);
      await new Promise(resolve => setTimeout(resolve, 10000));
    }

    console.log('\n' + '='.repeat(50));
    console.log('  ✅ İLK YÜKLEME TAMAMLANDI!');
    console.log('='.repeat(50));
    console.log(`\n📊 ÖZET:`);
    console.log(`   Toplam Eklenen: ${totalRecords}`);
    console.log(`   Toplam Atlanan: ${totalSkipped}`);
    console.log(`   Toplam Kayıt: ${totalRecords + totalSkipped}`);
    console.log('');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ HATA:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

initialLoad();
