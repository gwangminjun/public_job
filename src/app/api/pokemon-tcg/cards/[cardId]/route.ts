import { NextRequest, NextResponse } from 'next/server';
import { getCardByIdFromDb } from '@/lib/pokemon/db';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ cardId: string }> },
) {
  try {
    const { cardId } = await params;
    const result = await getCardByIdFromDb(cardId);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 404 });
  }
}
