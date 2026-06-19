import { NextRequest, NextResponse } from 'next/server';
import { getCardsFromDb } from '@/lib/pokemon/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const result = await getCardsFromDb({
      q: searchParams.get('q') ?? undefined,
      page: Number(searchParams.get('page') ?? 1),
      pageSize: Number(searchParams.get('pageSize') ?? 20),
      orderBy: searchParams.get('orderBy') ?? 'name',
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
