const https = require('https');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30');
  
  https.get('https://desaparecidos-terremoto-api.theempire.tech/api/personas?page=1&pageSize=1', {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  }, (apiRes) => {
    let rawData = '';
    apiRes.on('data', (chunk) => { rawData += chunk; });
    apiRes.on('end', () => {
      try {
        const data = JSON.parse(rawData);
        res.status(200).json(data.counts || { total: 0, sinContacto: 0, localizado: 0 });
      } catch (e) {
        res.status(500).json({ error: 'Failed to parse API response: ' + e.message });
      }
    });
  }).on('error', (e) => {
    res.status(500).json({ error: 'HTTPS request failed: ' + e.message });
  });
};

