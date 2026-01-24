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

    // URL 직접 구성 (serviceKey는 이미 인코딩된 상태로 전달)
    const queryParams = new URLSearchParams();
    queryParams.append('resultType', 'json');
    queryParams.append('numOfRows', searchParams.get('limit') || '20');
    queryParams.append('pageNo', searchParams.get('page') || '1');

    // 선택적 필터 파라미터 추가
    const keyword = searchParams.get('keyword');
    if (keyword) {
      queryParams.append('recrutPbancTtl', keyword);
    }

    const onlyOngoing = searchParams.get('onlyOngoing');
    if (onlyOngoing === 'true') {
      queryParams.append('ongoingYn', 'Y');
    }

    // serviceKey는 별도로 추가 (이중 인코딩 방지)
    const apiUrl = `${API_BASE_URL}/list?serviceKey=${encodeURIComponent(SERVICE_KEY)}&${queryParams.toString()}`;

    const response = await fetch(apiUrl, {
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API response error:', response.status, errorText);
      return NextResponse.json(
        { resultCode: response.status, resultMsg: `API error: ${response.status}`, result: [] },
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
