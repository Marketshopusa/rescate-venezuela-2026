module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30');
  
  try {
    const response = await fetch('https://desaparecidos-terremoto-api.theempire.tech/api/personas?page=1&pageSize=1');
    if (!response.ok) {
      throw new Error(API response status: );
    }
    const data = await response.json();
    res.status(200).json(data.counts || { total: 0, sinContacto: 0, localizado: 0 });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
