import { NextRequest, NextResponse } from 'next/server';
import { getKrCardsFromDb } from '@/lib/pokemon/kr-db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const result = await getKrCardsFromDb({
      q: searchParams.get('q') ?? undefined,
      page: searchParams.get('page') ? Number(searchParams.get('page')) : undefined,
      pageSize: searchParams.get('pageSize') ? Number(searchParams.get('pageSize')) : undefined,
      orderBy: searchParams.get('orderBy') ?? undefined,
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
