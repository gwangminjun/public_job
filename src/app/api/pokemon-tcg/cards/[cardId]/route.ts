import { NextRequest, NextResponse } from 'next/server';
import { getPokemonApiKey, getPokemonApiBaseUrl } from '@/lib/server/pokemonApiKey';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ cardId: string }> },
) {
  try {
    const { cardId } = await params;

    const res = await fetch(`${getPokemonApiBaseUrl()}/cards/${cardId}`, {
      headers: { 'X-Api-Key': getPokemonApiKey() },
      next: { revalidate: 600 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Card not found' }, { status: res.status });
    }

    return NextResponse.json(await res.json());
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
