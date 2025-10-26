#!/usr/bin/env node

/**
 * Local MongoDB'den Atlas'a Veri Transferi
 * 
 * Kullanım:
 *   node scripts/migrate-to-atlas.js
 * 
 * Not: 
 * - Local MongoDB çalışıyor olmalı
 * - Atlas connection string .env'de olmalı
 */

const mongoose = require('mongoose');
require('dotenv').config();


const LOCAL_URI = process.env.LOCAL_MONGO_URI || 'mongodb:


const ATLAS_URI = process.env.ATLAS_URI || 'mongodb+srv:


const earthquakeSchema = new mongoose.Schema({}, { strict: false });
const etlMetadataSchema = new mongoose.Schema({}, { strict: false });

async function migrate() {
  console.log('========================================');
  console.log('  📦 MongoDB Atlas\'a Veri Transferi');
  console.log('========================================\n');

  let localConn, atlasConn;

  try {
    
    console.log('🔌 Local MongoDB\'ye baglaniliyor...');
    localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
    console.log('✅ Local MongoDB baglandi\n');

    
    console.log('🔌 Atlas MongoDB\'ye baglaniliyor...');
    atlasConn = await mongoose.createConnection(ATLAS_URI).asPromise();
    console.log('✅ Atlas MongoDB baglandi\n');

    
    const LocalEarthquake = localConn.model('Earthquake', earthquakeSchema);
    const LocalEtlMetadata = localConn.model('EtlMetadata', etlMetadataSchema);
    
    const AtlasEarthquake = atlasConn.model('Earthquake', earthquakeSchema);
    const AtlasEtlMetadata = atlasConn.model('EtlMetadata', etlMetadataSchema);

    
    console.log('📊 Deprem verileri kontrol ediliyor...');
    const totalEarthquakes = await LocalEarthquake.countDocuments();
    console.log(`   Local'de ${totalEarthquakes} deprem bulundu\n`);

    if (totalEarthquakes === 0) {
      console.log('⚠️  Local\'de veri yok! İlk önce ETL çalıştır.');
      process.exit(1);
    }

    
    const atlasCount = await AtlasEarthquake.countDocuments();
    console.log(`   Atlas'ta ${atlasCount} deprem var\n`);

    if (atlasCount > 0) {
      console.log('⚠️  Atlas zaten veri içeriyor!');
      console.log('   Devam etmek istiyor musun? (Mevcut veriler silinecek)');
      console.log('   Çıkmak için Ctrl+C, devam için Enter...\n');
      
      
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      console.log('🗑️  Atlas verileri temizleniyor...');
      await AtlasEarthquake.deleteMany({});
      console.log('✅ Temizlendi\n');
    }

    
    const BATCH_SIZE = 1000;
    let transferred = 0;
    let page = 0;

    console.log('🚀 Transfer başlıyor...\n');

    while (transferred < totalEarthquakes) {
      const earthquakes = await LocalEarthquake
        .find()
        .skip(page * BATCH_SIZE)
        .limit(BATCH_SIZE)
        .lean();

      if (earthquakes.length === 0) break;

      
      await AtlasEarthquake.insertMany(earthquakes, { ordered: false });
      
      transferred += earthquakes.length;
      page++;

      const progress = ((transferred / totalEarthquakes) * 100).toFixed(1);
      console.log(`   ✓ ${transferred}/${totalEarthquakes} (${progress}%)`);
    }

    console.log('\n✅ Deprem verileri transfer edildi!\n');

    
    console.log('📝 ETL Metadata kontrol ediliyor...');
    const metadata = await LocalEtlMetadata.findOne();
    
    if (metadata) {
      console.log('   Metadata bulundu');
      
      
      const atlasMetadata = await AtlasEtlMetadata.findOne({ jobName: metadata.jobName });
      
      if (atlasMetadata) {
        console.log('   Metadata güncelleniyor...');
        await AtlasEtlMetadata.updateOne(
          { jobName: metadata.jobName },
          { $set: metadata.toObject() }
        );
      } else {
        console.log('   Metadata oluşturuluyor...');
        await AtlasEtlMetadata.create(metadata.toObject());
      }
      
      console.log('✅ Metadata transfer edildi!\n');
    }

    
    console.log('========================================');
    console.log('  ✅ TRANSFER TAMAMLANDI!');
    console.log('========================================\n');
    
    const finalCount = await AtlasEarthquake.countDocuments();
    const oldestEarthquake = await AtlasEarthquake.findOne().sort({ date: 1 });
    const newestEarthquake = await AtlasEarthquake.findOne().sort({ date: -1 });
    
    console.log('📊 ÖZET:');
    console.log(`   Toplam Deprem: ${finalCount}`);
    console.log(`   En Eski: ${oldestEarthquake?.date?.toISOString().split('T')[0] || 'N/A'}`);
    console.log(`   En Yeni: ${newestEarthquake?.date?.toISOString().split('T')[0] || 'N/A'}`);
    console.log('');
    console.log('🎉 Artık Atlas MongoDB kullanıma hazır!');
    console.log('');

  } catch (error) {
    console.error('\n❌ HATA:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    
    if (localConn) await localConn.close();
    if (atlasConn) await atlasConn.close();
    console.log('👋 Bağlantılar kapatıldı\n');
    process.exit(0);
  }
}


migrate();
