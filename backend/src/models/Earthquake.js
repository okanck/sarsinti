const mongoose = require('mongoose');

const earthquakeSchema = new mongoose.Schema({
  eventId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  date: {
    type: Date,
    required: true,
    index: true
  },
  
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  
  locationName: {
    type: String,
    required: true,
    index: true
  },
  
  magnitude: {
    type: Number,
    required: true,
    index: true
  },
  
  depth: {
    type: Number,
    required: true
  },
  
  magnitudeType: {
    type: String,
    default: 'ML'
  },
  
  latitude: {
    type: Number,
    required: true,
    index: true
  },
  
  longitude: {
    type: Number,
    required: true,
    index: true
  },
  
  rawData: {
    type: mongoose.Schema.Types.Mixed
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

earthquakeSchema.index({ location: '2dsphere' });
earthquakeSchema.index({ date: -1, magnitude: -1 });
earthquakeSchema.index({ magnitude: -1, date: -1 });

earthquakeSchema.statics.findByDateRange = function(startDate, endDate) {
  return this.find({
    date: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  }).sort({ date: -1 });
};

earthquakeSchema.statics.findByMinMagnitude = function(minMagnitude) {
  return this.find({
    magnitude: { $gte: minMagnitude }
  }).sort({ date: -1 });
};

earthquakeSchema.statics.findNearLocation = function(longitude, latitude, maxDistanceKm) {
  return this.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistanceKm * 1000
      }
    }
  });
};

module.exports = mongoose.model('Earthquake', earthquakeSchema);
