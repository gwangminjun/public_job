import { NextRequest, NextResponse } from 'next/server';
import { getSetsFromDb } from '@/lib/pokemon/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const result = await getSetsFromDb({
      q: searchParams.get('q') ?? undefined,
      page: Number(searchParams.get('page') ?? 1),
      pageSize: Number(searchParams.get('pageSize') ?? 250),
      orderBy: searchParams.get('orderBy') ?? '-releaseDate',
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
