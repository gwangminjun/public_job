import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = 'https://apis.data.go.kr/1051000/recruitment';
const SERVICE_KEY = process.env.DATA_GO_KR_API_KEY || '';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sn: string }> }
) {
  try {
    const { sn } = await params;

    const queryParams = new URLSearchParams({
      serviceKey: SERVICE_KEY,
      resultType: 'json',
      sn: sn,
    });

    const response = await fetch(`${API_BASE_URL}/detail?${queryParams.toString()}`, {
      next: { revalidate: 3600 }, // 1시간 캐싱
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Job detail API error:', error);
    return NextResponse.json(
      { resultCode: 500, resultMsg: 'Internal Server Error', result: null },
      { status: 500 }
    );
  }
}
