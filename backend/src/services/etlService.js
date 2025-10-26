const afadService = require('./afadService');
const Earthquake = require('../models/Earthquake');
const EtlMetadata = require('../models/EtlMetadata');

class EtlService {
  constructor() {
    this.batchSize = parseInt(process.env.ETL_BATCH_SIZE) || 1000;
  }

  /**
   * ETL işlemini çalıştırır
   * @param {Object} options - ETL seçenekleri
   * @param {Date} options.startDate - Başlangıç tarihi (opsiyonel, metadata'dan alınır)
   * @param {Date} options.endDate - Bitiş tarihi (opsiyonel, bugün)
   * @param {number} options.minMagnitude - Minimum büyüklük (opsiyonel)
   * @returns {Promise<Object>} ETL sonucu
   */
  async run(options = {}) {
    const startTime = Date.now();
    console.log('\n🚀 ETL İşlemi Başlatılıyor...');
    console.log('⏰ Zaman:', new Date().toLocaleString('tr-TR'));
    
    try {
      
      const metadata = await EtlMetadata.getOrCreate();
      
      
      const startDate = options.startDate || new Date(metadata.lastSuccessfulDate);
      const endDate = options.endDate || new Date();
      
      
      if (startDate >= endDate) {
        console.log('ℹ️  Çekilecek yeni veri yok (başlangıç >= bitiş)');
        return {
          success: true,
          recordsAdded: 0,
          recordsSkipped: 0,
          message: 'Çekilecek yeni veri yok'
        };
      }
      
      console.log(`📅 Tarih aralığı: ${this.formatDate(startDate)} - ${this.formatDate(endDate)}`);
      
      
      metadata.lastRunStatus = 'running';
      await metadata.save();
      
      
      const earthquakes = await afadService.fetchEarthquakes({
        start: this.formatDate(startDate),
        end: this.formatDate(endDate),
        minMagnitude: options.minMagnitude
      });
      
      if (earthquakes.length === 0) {
        console.log('ℹ️  AFAD API\'den veri gelmedi');
        await metadata.recordSuccess(endDate, 0);
        return {
          success: true,
          recordsAdded: 0,
          recordsSkipped: 0,
          message: 'Veri bulunamadı'
        };
      }
      
      
      const result = await this.saveEarthquakes(earthquakes);
      
      
      await metadata.recordSuccess(endDate, result.recordsAdded);
      
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      
      console.log('\n✅ ETL İşlemi Tamamlandı');
      console.log(`⏱️  Süre: ${duration} saniye`);
      console.log(`📊 Eklenen: ${result.recordsAdded}, Atlanan: ${result.recordsSkipped}`);
      
      return {
        success: true,
        ...result,
        duration: parseFloat(duration),
        dateRange: {
          start: startDate,
          end: endDate
        }
      };
      
    } catch (error) {
      console.error('\n❌ ETL İşlemi Başarısız:', error.message);
      
      
      try {
        const metadata = await EtlMetadata.getOrCreate();
        await metadata.recordFailure(error);
      } catch (metaError) {
        console.error('❌ Metadata kaydedilemedi:', metaError.message);
      }
      
      throw error;
    }
  }

  /**
   * Deprem verilerini MongoDB'ye kaydeder
   * @param {Array} earthquakes - Ham AFAD verileri
   * @returns {Promise<Object>} Kayıt sonucu
   */
  async saveEarthquakes(earthquakes) {
    let recordsAdded = 0;
    let recordsSkipped = 0;
    let errors = [];

    console.log(`\n💾 ${earthquakes.length} deprem kaydediliyor...`);

    
    for (let i = 0; i < earthquakes.length; i += this.batchSize) {
      const batch = earthquakes.slice(i, i + this.batchSize);
      
      console.log(`   Batch ${Math.floor(i / this.batchSize) + 1}/${Math.ceil(earthquakes.length / this.batchSize)}: ${batch.length} kayıt`);
      
      for (const rawData of batch) {
        try {
          
          const transformedData = afadService.transformData(rawData);
          
          
          const existing = await Earthquake.findOne({ eventId: transformedData.eventId });
          
          if (existing) {
            recordsSkipped++;
            continue;
          }
          
          
          await Earthquake.create(transformedData);
          recordsAdded++;
          
        } catch (error) {
          console.error(`   ⚠️  Kayıt hatası (eventId: ${rawData.eventID}):`, error.message);
          errors.push({
            eventId: rawData.eventID,
            error: error.message
          });
        }
      }
    }

    if (errors.length > 0) {
      console.log(`⚠️  ${errors.length} kayıt hata ile karşılaştı`);
    }

    return {
      recordsAdded,
      recordsSkipped,
      errors
    };
  }

  /**
   * Tarihi YYYY-MM-DD formatına çevirir
   * @param {Date} date
   * @returns {string}
   */
  formatDate(date) {
    return date.toISOString().split('T')[0];
  }

  /**
   * ETL durumunu gösterir
   * @returns {Promise<Object>}
   */
  async getStatus() {
    const metadata = await EtlMetadata.getOrCreate();
    const totalEarthquakes = await Earthquake.countDocuments();
    
    const oldestEarthquake = await Earthquake.findOne().sort({ date: 1 });
    const newestEarthquake = await Earthquake.findOne().sort({ date: -1 });
    
    return {
      metadata: {
        lastSuccessfulDate: metadata.lastSuccessfulDate,
        lastRunAt: metadata.lastRunAt,
        lastRunStatus: metadata.lastRunStatus,
        lastRunRecordsAdded: metadata.lastRunRecordsAdded,
        lastRunError: metadata.lastRunError,
        totalRecordsProcessed: metadata.totalRecordsProcessed,
        stats: metadata.stats
      },
      database: {
        totalEarthquakes,
        oldestDate: oldestEarthquake?.date,
        newestDate: newestEarthquake?.date,
        dateRange: oldestEarthquake && newestEarthquake ? {
          start: oldestEarthquake.date,
          end: newestEarthquake.date
        } : null
      }
    };
  }
}

module.exports = new EtlService();
