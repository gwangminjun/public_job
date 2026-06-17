import { NextRequest, NextResponse } from 'next/server';
import { getPokemonApiKey, getPokemonApiBaseUrl } from '@/lib/server/pokemonApiKey';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ setId: string }> },
) {
  try {
    const { setId } = await params;

    const res = await fetch(`${getPokemonApiBaseUrl()}/sets/${setId}`, {
      headers: { 'X-Api-Key': getPokemonApiKey() },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Set not found' }, { status: res.status });
    }

    return NextResponse.json(await res.json());
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
