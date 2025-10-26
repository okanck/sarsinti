require('dotenv').config();
const cron = require('node-cron');
const connectDB = require('../config/database');
const etlService = require('../services/etlService');

/**
 * ETL Scheduler - Her saat başı AFAD verilerini çeker
 * Kullanım:
 *   npm run etl:schedule
 *   node src/scripts/scheduler.js
 */

let isRunning = false;

async function runScheduledEtl() {
  
  if (isRunning) {
    console.log('⏳ ETL zaten çalışıyor, bu çalıştırma atlandı...');
    return;
  }

  isRunning = true;

  try {
    console.log('\n' + '='.repeat(50));
    console.log('⏰ Zamanlanmış ETL Başlatılıyor...');
    console.log('   Zaman:', new Date().toLocaleString('tr-TR'));
    console.log('='.repeat(50));

    const result = await etlService.run();

    console.log('\n✅ Zamanlanmış ETL Tamamlandı');
    console.log('📊 Sonuç:', {
      recordsAdded: result.recordsAdded,
      recordsSkipped: result.recordsSkipped,
      duration: `${result.duration}s`
    });

  } catch (error) {
    console.error('\n❌ Zamanlanmış ETL Hatası:', error.message);
  } finally {
    isRunning = false;
  }
}

async function startScheduler() {
  console.log('\n========================================');
  console.log('  ⏰ SARSINTI ETL SCHEDULER            ');
  console.log('========================================');

  try {
    console.log('✅ Scheduler başlatılıyor...');

    
    await runScheduledEtl();

    
    const intervalMinutes = parseInt(process.env.ETL_INTERVAL_MINUTES) || 60;
    
    
    let cronPattern;
    if (intervalMinutes === 1) {
      cronPattern = '* * * * *'; 
    } else if (intervalMinutes === 60) {
      cronPattern = '0 * * * *'; 
    } else if (intervalMinutes < 60) {
      cronPattern = `*/${intervalMinutes} * * * *`; 
    } else {
      console.warn(`⚠️  ${intervalMinutes} dakika desteklenmiyor, 60 dakikaya ayarlanıyor`);
      cronPattern = '0 * * * *';
    }
    
    console.log(`⏰ Çalışma sıklığı: Her ${intervalMinutes} dakika`);
    console.log(`📋 Cron pattern: ${cronPattern}`);
    
    cron.schedule(cronPattern, async () => {
      await runScheduledEtl();
    });

    console.log('✅ Scheduler aktif!\n');

  } catch (error) {
    console.error('\n❌ Scheduler başlatma hatası:', error.message);
  }
}


if (require.main === module) {
  (async () => {
    console.log('========================================');
    console.log('  STANDALONE ETL SCHEDULER             ');
    console.log('========================================\n');

    await connectDB();
    await startScheduler();

    
    process.stdin.resume();

    
    process.on('SIGINT', () => {
      console.log('\n\n⏹️  Scheduler durduruluyor...');
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      console.log('\n\n⏹️  Scheduler durduruluyor...');
      process.exit(0);
    });
  })();
}


module.exports = { startScheduler };
