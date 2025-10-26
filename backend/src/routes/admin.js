const express = require('express');
const router = express.Router();
const etlService = require('../services/etlService');


const adminAuth = (req, res, next) => {
  const adminSecret = req.headers['x-admin-secret'] || req.query.secret;
  
  if (!adminSecret) {
    return res.status(401).json({
      success: false,
      error: 'Admin authentication required. Provide X-Admin-Secret header or ?secret= query param.'
    });
  }
  
  if (adminSecret !== process.env.ADMIN_SECRET) {
    return res.status(403).json({
      success: false,
      error: 'Invalid admin secret'
    });
  }
  
  next();
};

/**
 * POST /api/admin/etl/trigger
 * Manuel olarak ETL'i tetikler
 */
router.post('/etl/trigger', adminAuth, async (req, res) => {
  try {
    console.log('🔧 Admin ETL trigger başlatıldı');
    
    const { startDate, endDate, minMagnitude } = req.body;
    
    
    etlService.run({
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      minMagnitude
    }).then((result) => {
      console.log('✅ Admin ETL tamamlandı:', result);
    }).catch((error) => {
      console.error('❌ Admin ETL hatası:', error);
    });
    
    res.json({
      success: true,
      message: 'ETL başlatıldı (arka planda çalışıyor)',
      note: 'ETL durumunu kontrol etmek için GET /api/earthquakes/etl-status kullanın'
    });
    
  } catch (error) {
    console.error('❌ Admin ETL trigger hatası:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/admin/etl/reset
 * ETL metadata'yı sıfırlar (1960'dan başlar)
 */
router.post('/etl/reset', adminAuth, async (req, res) => {
  try {
    const EtlMetadata = require('../models/EtlMetadata');
    
    const metadata = await EtlMetadata.getOrCreate();
    const startDate = new Date(process.env.ETL_START_DATE || '1960-01-01');
    
    metadata.lastSuccessfulDate = startDate;
    metadata.lastRunStatus = 'success';
    metadata.lastRunError = null;
    await metadata.save();
    
    console.log('🔄 ETL metadata sıfırlandı:', startDate);
    
    res.json({
      success: true,
      message: 'ETL metadata sıfırlandı',
      newStartDate: startDate
    });
    
  } catch (error) {
    console.error('❌ ETL reset hatası:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/admin/earthquakes/all
 * Tüm deprem verilerini siler (DİKKAT!)
 */
router.delete('/earthquakes/all', adminAuth, async (req, res) => {
  try {
    const Earthquake = require('../models/Earthquake');
    
    const result = await Earthquake.deleteMany({});
    
    console.log('🗑️  Tüm depremler silindi:', result.deletedCount);
    
    res.json({
      success: true,
      message: `${result.deletedCount} deprem silindi`,
      deletedCount: result.deletedCount
    });
    
  } catch (error) {
    console.error('❌ Deprem silme hatası:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/admin/health
 * Admin endpoint health check
 */
router.get('/health', adminAuth, (req, res) => {
  res.json({
    success: true,
    message: 'Admin API is working',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
