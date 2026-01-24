import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = 'https://apis.data.go.kr/1051000/recruitment';
const SERVICE_KEY = process.env.DATA_GO_KR_API_KEY || '';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const params = new URLSearchParams({
      serviceKey: SERVICE_KEY,
      resultType: 'json',
      numOfRows: searchParams.get('limit') || '20',
      pageNo: searchParams.get('page') || '1',
    });

    // 선택적 필터 파라미터 추가
    const keyword = searchParams.get('keyword');
    if (keyword) {
      params.append('recrutPbancTtl', keyword);
    }

    const onlyOngoing = searchParams.get('onlyOngoing');
    if (onlyOngoing === 'true') {
      params.append('ongoingYn', 'Y');
    }

    const response = await fetch(`${API_BASE_URL}/list?${params.toString()}`, {
      next: { revalidate: 300 }, // 5분 캐싱
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Jobs API error:', error);
    return NextResponse.json(
      { resultCode: 500, resultMsg: 'Internal Server Error', result: [] },
      { status: 500 }
    );
  }
}
