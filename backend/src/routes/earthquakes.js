const express = require('express');
const router = express.Router();
const Earthquake = require('../models/Earthquake');
const etlService = require('../services/etlService');

/**
 * GET /api/earthquakes
 * Tüm depremleri listele (sayfalama ile)
 */
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 100,
      minMagnitude,
      startDate,
      endDate,
      sort = '-date' 
    } = req.query;

    const query = {};

    
    if (minMagnitude) {
      query.magnitude = { $gte: parseFloat(minMagnitude) };
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Earthquake.countDocuments(query);

    const earthquakes = await Earthquake.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-rawData'); 

    res.json({
      success: true,
      data: earthquakes,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('❌ Depremler listelenirken hata:', error);
    res.status(500).json({
      success: false,
      error: 'Depremler yüklenirken bir hata oluştu'
    });
  }
});

/**
 * GET /api/earthquakes/stats
 * İstatistikler
 */
router.get('/stats', async (req, res) => {
  try {
    const total = await Earthquake.countDocuments();
    
    const magnitudeStats = await Earthquake.aggregate([
      {
        $group: {
          _id: null,
          avgMagnitude: { $avg: '$magnitude' },
          maxMagnitude: { $max: '$magnitude' },
          minMagnitude: { $min: '$magnitude' },
          avgDepth: { $avg: '$depth' }
        }
      }
    ]);

    const oldest = await Earthquake.findOne().sort({ date: 1 });
    const newest = await Earthquake.findOne().sort({ date: -1 });

    
    const magnitudeDistribution = await Earthquake.aggregate([
      {
        $bucket: {
          groupBy: '$magnitude',
          boundaries: [0, 2, 3, 4, 5, 6, 7, 10],
          default: 'other',
          output: {
            count: { $sum: 1 }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        total,
        dateRange: {
          oldest: oldest?.date,
          newest: newest?.date
        },
        magnitude: magnitudeStats[0] || {},
        distribution: magnitudeDistribution
      }
    });

  } catch (error) {
    console.error('❌ İstatistikler hesaplanırken hata:', error);
    res.status(500).json({
      success: false,
      error: 'İstatistikler hesaplanırken bir hata oluştu'
    });
  }
});

/**
 * GET /api/earthquakes/recent
 * Son 24 saatteki depremler
 */
router.get('/recent', async (req, res) => {
  try {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const earthquakes = await Earthquake.find({
      date: { $gte: oneDayAgo }
    })
      .sort('-date')
      .select('-rawData');

    res.json({
      success: true,
      data: earthquakes,
      count: earthquakes.length
    });

  } catch (error) {
    console.error('❌ Son depremler yüklenirken hata:', error);
    res.status(500).json({
      success: false,
      error: 'Son depremler yüklenirken bir hata oluştu'
    });
  }
});

/**
 * GET /api/earthquakes/near
 * Belirli bir konuma yakın depremler
 */
router.get('/near', async (req, res) => {
  try {
    const { latitude, longitude, maxDistance = 100 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: 'latitude ve longitude parametreleri gerekli'
      });
    }

    const earthquakes = await Earthquake.findNearLocation(
      parseFloat(longitude),
      parseFloat(latitude),
      parseFloat(maxDistance)
    ).select('-rawData');

    res.json({
      success: true,
      data: earthquakes,
      count: earthquakes.length,
      query: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        maxDistanceKm: parseFloat(maxDistance)
      }
    });

  } catch (error) {
    console.error('❌ Yakın depremler aranırken hata:', error);
    res.status(500).json({
      success: false,
      error: 'Yakın depremler aranırken bir hata oluştu'
    });
  }
});

/**
 * GET /api/earthquakes/etl-status
 * ETL durumunu gösterir
 */
router.get('/etl-status', async (req, res) => {
  try {
    const status = await etlService.getStatus();
    
    res.json({
      success: true,
      data: status
    });

  } catch (error) {
    console.error('❌ ETL durumu alınırken hata:', error);
    res.status(500).json({
      success: false,
      error: 'ETL durumu alınırken bir hata oluştu'
    });
  }
});

/**
 * GET /api/earthquakes/:id
 * Tek bir depremi getir
 */
router.get('/:id', async (req, res) => {
  try {
    const earthquake = await Earthquake.findById(req.params.id);

    if (!earthquake) {
      return res.status(404).json({
        success: false,
        error: 'Deprem bulunamadı'
      });
    }

    res.json({
      success: true,
      data: earthquake
    });

  } catch (error) {
    console.error('❌ Deprem yüklenirken hata:', error);
    res.status(500).json({
      success: false,
      error: 'Deprem yüklenirken bir hata oluştu'
    });
  }
});

module.exports = router;
