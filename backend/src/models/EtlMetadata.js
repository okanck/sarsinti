const mongoose = require('mongoose');

const etlMetadataSchema = new mongoose.Schema({
  jobName: {
    type: String,
    required: true,
    unique: true,
    default: 'afad-earthquake-etl'
  },
  
  lastSuccessfulDate: {
    type: Date,
    required: true
  },
  
  lastRunAt: {
    type: Date,
    default: Date.now
  },
  
  lastRunStatus: {
    type: String,
    enum: ['success', 'failed', 'running'],
    default: 'success'
  },
  
  lastRunRecordsAdded: {
    type: Number,
    default: 0
  },
  
  lastRunError: {
    type: String
  },
  
  totalRecordsProcessed: {
    type: Number,
    default: 0
  },
  
  stats: {
    totalRuns: { type: Number, default: 0 },
    successfulRuns: { type: Number, default: 0 },
    failedRuns: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

etlMetadataSchema.statics.getOrCreate = async function() {
  let metadata = await this.findOne({ jobName: 'afad-earthquake-etl' });
  
  if (!metadata) {
    const startDate = new Date(process.env.ETL_START_DATE || '1960-01-01');
    metadata = await this.create({
      jobName: 'afad-earthquake-etl',
      lastSuccessfulDate: startDate,
      lastRunStatus: 'success'
    });
    console.log('ETL metadata created, start date:', startDate.toISOString().split('T')[0]);
  }
  
  return metadata;
};

etlMetadataSchema.methods.recordSuccess = async function(endDate, recordsAdded) {
  this.lastSuccessfulDate = endDate;
  this.lastRunAt = new Date();
  this.lastRunStatus = 'success';
  this.lastRunRecordsAdded = recordsAdded;
  this.lastRunError = null;
  this.totalRecordsProcessed += recordsAdded;
  this.stats.totalRuns += 1;
  this.stats.successfulRuns += 1;
  
  await this.save();
};

etlMetadataSchema.methods.recordFailure = async function(error) {
  this.lastRunAt = new Date();
  this.lastRunStatus = 'failed';
  this.lastRunError = error.message;
  this.stats.totalRuns += 1;
  this.stats.failedRuns += 1;
  
  await this.save();
};

module.exports = mongoose.model('EtlMetadata', etlMetadataSchema);
