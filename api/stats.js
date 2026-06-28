const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30');
  
  try {
    const filePath = path.join(process.cwd(), 'official_data.json');
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(content);
      if (data.stats) {
        return res.status(200).json({
          total: data.stats.total || 0,
          sinContacto: data.stats.missing || 0,
          localizado: data.stats.safe || 0,
          source: 'cache'
        });
      }
    }
  } catch (e) {
    console.error('Failed to read official stats:', e);
  }
  
  res.status(200).json({ total: 0, sinContacto: 0, localizado: 0, source: 'error' });
};
