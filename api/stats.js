const https = require('https');
const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30');
  
  const getFallbackStats = () => {
    try {
      const filePath = path.join(process.cwd(), 'official_data.json');
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);
        if (data.stats) {
          return {
            total: data.stats.total || 0,
            sinContacto: data.stats.missing || 0,
            localizado: data.stats.safe || 0,
            source: 'fallback'
          };
        }
      }
    } catch (e) {
      console.error('Failed to read fallback stats:', e);
    }
    return { total: 0, sinContacto: 0, localizado: 0, source: 'error' };
  };

  const reqOptions = {
    hostname: 'desaparecidos-terremoto-api.theempire.tech',
    path: '/api/personas?page=1&pageSize=1',
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json'
    },
    timeout: 5000
  };

  const apiReq = https.request(reqOptions, (apiRes) => {
    let rawData = '';
    apiRes.on('data', (chunk) => { rawData += chunk; });
    apiRes.on('end', () => {
      try {
        if (apiRes.statusCode !== 200) {
          throw new Error(`API returned status code ${apiRes.statusCode}`);
        }
        const data = JSON.parse(rawData);
        if (data.counts && data.counts.total) {
          res.status(200).json(data.counts);
        } else {
          throw new Error('API response did not contain counts');
        }
      } catch (e) {
        console.warn('API error, returning fallback:', e.message);
        res.status(200).json(getFallbackStats());
      }
    });
  });

  apiReq.on('error', (e) => {
    console.warn('API connection error, returning fallback:', e.message);
    res.status(200).json(getFallbackStats());
  });

  apiReq.on('timeout', () => {
    apiReq.destroy();
  });

  apiReq.end();
};
