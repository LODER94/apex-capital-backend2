export default async (req, res) => {
  // 1. CORS 보안 프리패스 설정 (기존 코드에 있던 필수 항목)
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 2. Vercel 환경 변수(API 키) 불러오기
  const alpkey = process.env.Alpkey;
  const newkey = process.env.Newkey;
  const finkey = process.env.Finkey;

  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'URL parameter is required' });

    let decodedUrl = decodeURIComponent(url);

    // 3. 💡 요청하는 외부 사이트 주소에 따라 알맞은 API 키를 자동으로 붙여주는 로직
    if (decodedUrl.includes('alphavantage')) { // 예시: 알파브이티지 주소일 때
      decodedUrl = decodedUrl.includes('?') ? `${decodedUrl}&apikey=${alpkey}` : `${decodedUrl}?apikey=${alpkey}`;
    } else if (decodedUrl.includes('newsapi')) { // 예시: 뉴스 API 주소일 때
      decodedUrl = decodedUrl.includes('?') ? `${decodedUrl}&apiKey=${newkey}` : `${decodedUrl}?apiKey=${newkey}`;
    } else if (decodedUrl.includes('fmp') || decodedUrl.includes('financialmodelingprep')) { // 예시: 금융 데이터 주소일 때
      decodedUrl = decodedUrl.includes('?') ? `${decodedUrl}&apikey=${finkey}` : `${decodedUrl}?apikey=${finkey}`;
    }

    // 4. API 키가 결합된 최종 주소로 요청 보내기
    const response = await fetch(decodedUrl, {
      method: 'GET',
      headers: { 'User-Agent': 'APEX-Capital-Bot/1.0' }
    });

    const contentType = response.headers.get('content-type');
    let data = contentType && contentType.includes('application/json') ? await response.json() : await response.text();

    if (!response.ok) {
      return res.status(response.status).json({ error: `API returned status ${response.status}`, details: data });
    }

    // 5. 최종 데이터 반환
    res.status(200).json(data);

  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch from API', message: error.message });
  }
};
