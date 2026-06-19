import { NextRequest, NextResponse } from 'next/server';
import { getKrSetsFromDb } from '@/lib/pokemon/kr-db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const result = await getKrSetsFromDb({
      q: searchParams.get('q') ?? undefined,
      series: searchParams.get('series') ?? undefined,
      type: searchParams.get('type') ?? undefined,
      page: searchParams.get('page') ? Number(searchParams.get('page')) : undefined,
      pageSize: searchParams.get('pageSize') ? Number(searchParams.get('pageSize')) : undefined,
      orderBy: searchParams.get('orderBy') ?? undefined,
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
