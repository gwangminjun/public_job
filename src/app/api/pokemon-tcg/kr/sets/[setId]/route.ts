import { NextRequest, NextResponse } from 'next/server';
import { getKrSetByIdFromDb } from '@/lib/pokemon/kr-db';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ setId: string }> },
) {
  try {
    const { setId } = await params;
    const result = await getKrSetByIdFromDb(setId);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 404 });
  }
}
