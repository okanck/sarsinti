const axios = require('axios');

class AfadService {
  constructor() {
    this.baseURL = process.env.AFAD_API_URL || 'https:
    this.timeout = parseInt(process.env.AFAD_API_TIMEOUT) || 30000;
  }

  async fetchEarthquakes(params = {}, retries = 3) {
    try {
      const { start, end, minMagnitude } = params;
      
      console.log('Fetching from AFAD API:', start, '-', end);

      const queryParams = {
        start: start,
        end: end,
      };

      if (minMagnitude) {
        queryParams.minmag = minMagnitude;
      }

      const response = await axios.get(this.baseURL, {
        params: queryParams,
        timeout: this.timeout,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Sarsinti-ETL/1.0'
        }
      });

      if (!response.data) {
        throw new Error('No data received from AFAD API');
      }

      const earthquakes = Array.isArray(response.data) ? response.data : [];
      
      console.log('Received', earthquakes.length, 'earthquakes');
      
      return earthquakes;

    } catch (error) {
      console.error('AFAD API error:', error.message);
      
      if (error.response) {
        console.error('Status:', error.response.status);
        
        if (error.response.status === 429 && retries > 0) {
          const waitTime = Math.pow(2, 4 - retries) * 5000;
          console.log('Rate limit, waiting', waitTime/1000, 'seconds. Retries left:', retries);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          return this.fetchEarthquakes(params, retries - 1);
        }
        
        if (error.response.status === 503 && retries > 0) {
          const waitTime = 10000;
          console.log('Service unavailable, waiting', waitTime/1000, 'seconds');
          await new Promise(resolve => setTimeout(resolve, waitTime));
          return this.fetchEarthquakes(params, retries - 1);
        }
      }
      
      throw new Error(`AFAD API request failed: ${error.message}`);
    }
  }

  transformData(afadData) {
    try {
      return {
        eventId: afadData.eventID || afadData.event_id || String(afadData._id),
        date: new Date(afadData.date || afadData.datetime || afadData.time),
        location: {
          type: 'Point',
          coordinates: [
            parseFloat(afadData.longitude || afadData.lon || afadData.geojson?.coordinates?.[0]),
            parseFloat(afadData.latitude || afadData.lat || afadData.geojson?.coordinates?.[1])
          ]
        },
        locationName: afadData.location || afadData.location_name || afadData.title || 'Unknown',
        magnitude: parseFloat(afadData.magnitude || afadData.mag || afadData.ml || 0),
        depth: parseFloat(afadData.depth || afadData.depth_km || 0),
        magnitudeType: afadData.magnitudeType || afadData.mag_type || 'ML',
        latitude: parseFloat(afadData.latitude || afadData.lat || afadData.geojson?.coordinates?.[1]),
        longitude: parseFloat(afadData.longitude || afadData.lon || afadData.geojson?.coordinates?.[0]),
        rawData: afadData
      };
    } catch (error) {
      console.error('Data transform error:', error.message);
      console.error('Data:', afadData);
      throw error;
    }
  }
}

module.exports = new AfadService();
