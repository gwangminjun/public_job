import { NextRequest, NextResponse } from 'next/server';
import { getPokemonApiKey, getPokemonApiBaseUrl } from '@/lib/server/pokemonApiKey';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const params = new URLSearchParams();

    const q = searchParams.get('q');
    const page = searchParams.get('page') ?? '1';
    const pageSize = searchParams.get('pageSize') ?? '250';
    const orderBy = searchParams.get('orderBy') ?? '-releaseDate';

    if (q) params.set('q', q);
    params.set('page', page);
    params.set('pageSize', pageSize);
    params.set('orderBy', orderBy);

    const res = await fetch(`${getPokemonApiBaseUrl()}/sets?${params}`, {
      headers: { 'X-Api-Key': getPokemonApiKey() },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch sets' }, { status: res.status });
    }

    return NextResponse.json(await res.json());
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
