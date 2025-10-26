require('dotenv').config();
const connectDB = require('../config/database');
const etlService = require('../services/etlService');

/**
 * ETL Script - Manuel veya cron job ile çalıştırılabilir
 * Kullanım:
 *   npm run etl
 *   node src/scripts/runEtl.js
 */

async function main() {
  console.log('========================================');
  console.log('  SARSINTI ETL - AFAD Deprem Verileri  ');
  console.log('========================================\n');

  try {
    
    await connectDB();

    
    const result = await etlService.run();

    console.log('\n📋 SONUÇ:', JSON.stringify(result, null, 2));

    
    process.exit(0);

  } catch (error) {
    console.error('\n❌ HATA:', error.message);
    console.error(error.stack);
    
    
    process.exit(1);
  }
}


main();
