import { NextRequest, NextResponse } from 'next/server';
import { getKrCardByIdFromDb } from '@/lib/pokemon/kr-db';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ cardId: string }> },
) {
  try {
    const { cardId } = await params;
    const result = await getKrCardByIdFromDb(cardId);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 404 });
  }
}
