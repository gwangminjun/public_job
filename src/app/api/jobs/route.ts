import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = 'https://apis.data.go.kr/1051000/recruitment';
const SERVICE_KEY = process.env.DATA_GO_KR_API_KEY || '';

export async function GET(request: NextRequest) {
  try {
    // 환경변수 체크
    if (!SERVICE_KEY) {
      return NextResponse.json(
        { resultCode: 500, resultMsg: 'API key not configured', result: [] },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);

    const numOfRows = searchParams.get('limit') || '20';
    const pageNo = searchParams.get('page') || '1';
    const keyword = searchParams.get('keyword') || '';
    const onlyOngoing = searchParams.get('onlyOngoing');

    // URL 직접 구성
    let apiUrl = `${API_BASE_URL}/list?serviceKey=${SERVICE_KEY}&resultType=json&numOfRows=${numOfRows}&pageNo=${pageNo}`;

    if (keyword) {
      apiUrl += `&recrutPbancTtl=${encodeURIComponent(keyword)}`;
    }

    if (onlyOngoing === 'true') {
      apiUrl += '&ongoingYn=Y';
    }

    const response = await fetch(apiUrl, {
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API response error:', response.status, errorText);
      return NextResponse.json(
        { resultCode: response.status, resultMsg: `API error: ${response.status}`, result: [], debug: apiUrl.replace(SERVICE_KEY, 'HIDDEN') },
        { status: 500 }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Jobs API error:', error);
    return NextResponse.json(
      { resultCode: 500, resultMsg: String(error), result: [] },
      { status: 500 }
    );
  }
}
