export default async (req, res) => {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // OPTIONS 요청 처리
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    // URL 디코딩
    const decodedUrl = decodeURIComponent(url);

    console.log(`[Proxy] Fetching: ${decodedUrl}`);

    // API 요청
    const response = await fetch(decodedUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'APEX-Capital-Bot/1.0'
      }
    });

    // 응답 처리
    const contentType = response.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // 상태 코드 확인
    if (!response.ok) {
      console.error(`[Proxy Error] Status: ${response.status}, Data:`, data);
      return res.status(response.status).json({ 
        error: `API returned status ${response.status}`,
        details: data 
      });
    }

    console.log(`[Proxy Success] Got response from API`);
    res.status(200).json(data);

  } catch (error) {
    console.error('[Proxy Error]', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch from API',
      message: error.message
    });
  }
};
export default async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'URL parameter is required' });
    const decodedUrl = decodeURIComponent(url);
    const response = await fetch(decodedUrl, {
      method: 'GET',
      headers: { 'User-Agent': 'APEX-Capital-Bot/1.0' }
    });
    const contentType = response.headers.get('content-type');
    let data = contentType && contentType.includes('application/json') ? await response.json() : await response.text();
    if (!response.ok) return res.status(response.status).json({ error: `API returned status ${response.status}`, details: data });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch from API', message: error.message });
  }
};
