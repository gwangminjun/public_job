import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = 'https://apis.data.go.kr/1051000/recruitment';

function getServiceKey(): string {
  return (
    process.env.DATA_GO_KR_API_KEY?.trim() ||
    process.env.DATA_GO_API_KEY?.trim() ||
    ''
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sn: string }> }
) {
  try {
    const serviceKey = getServiceKey();

    // 환경변수 체크
    if (!serviceKey) {
      return NextResponse.json(
        {
          resultCode: 500,
          resultMsg: 'API key not configured (set DATA_GO_KR_API_KEY)',
          result: null,
        },
        { status: 500 }
      );
    }

    const { sn } = await params;

    // URL 직접 구성 (인코딩 없이)
    const apiUrl = `${API_BASE_URL}/detail?serviceKey=${serviceKey}&resultType=json&sn=${sn}`;

    const response = await fetch(apiUrl, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API response error:', response.status, errorText);
      return NextResponse.json(
        { resultCode: response.status, resultMsg: `API error: ${response.status}`, result: null },
        { status: 500 }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Job detail API error:', error);
    return NextResponse.json(
      { resultCode: 500, resultMsg: String(error), result: null },
      { status: 500 }
    );
  }
}
