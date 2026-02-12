import { NextRequest, NextResponse } from 'next/server';
import { Job } from '@/lib/types';

const API_BASE_URL = 'https://apis.data.go.kr/1051000/recruitment';
const SERVICE_KEY = process.env.DATA_GO_KR_API_KEY || '';

let cachedJobs: Job[] = [];
let lastFetchTime = 0;
const CACHE_DURATION = 1000 * 60 * 5;

interface SuggestionItem {
  text: string;
  type: 'institution' | 'keyword';
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function rankAndSlice(items: SuggestionItem[], query: string, limit: number): SuggestionItem[] {
  const q = normalize(query);

  return items
    .sort((a, b) => {
      const aStarts = normalize(a.text).startsWith(q) ? 0 : 1;
      const bStarts = normalize(b.text).startsWith(q) ? 0 : 1;
      if (aStarts !== bStarts) return aStarts - bStarts;

      if (a.type !== b.type) {
        return a.type === 'institution' ? -1 : 1;
      }

      return a.text.localeCompare(b.text, 'ko');
    })
    .slice(0, limit);
}

export async function GET(request: NextRequest) {
  try {
    if (!SERVICE_KEY) {
      return NextResponse.json({ resultCode: 500, resultMsg: 'API key not configured', suggestions: [] }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim() || '';
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '8', 10), 1), 20);

    if (!q) {
      return NextResponse.json({ resultCode: 200, resultMsg: 'Success', suggestions: [] });
    }

    const now = Date.now();
    if (cachedJobs.length === 0 || now - lastFetchTime > CACHE_DURATION) {
      const apiUrl = `${API_BASE_URL}/list?serviceKey=${SERVICE_KEY}&resultType=json&numOfRows=1000&pageNo=1`;
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`External API error: ${response.status}`);
      }

      const data = await response.json();
      cachedJobs = Array.isArray(data.result) ? data.result : [];
      lastFetchTime = now;
    }

    const lowered = normalize(q);
    const map = new Map<string, SuggestionItem>();

    for (const job of cachedJobs) {
      const inst = (job.instNm || '').trim();
      if (inst && normalize(inst).includes(lowered)) {
        const key = `institution:${inst}`;
        map.set(key, { text: inst, type: 'institution' });
      }

      const ncsChunks = (job.ncsCdNmLst || '')
        .split(',')
        .map((chunk) => chunk.trim())
        .filter(Boolean);

      for (const keyword of ncsChunks) {
        if (normalize(keyword).includes(lowered)) {
          const key = `keyword:${keyword}`;
          map.set(key, { text: keyword, type: 'keyword' });
        }
      }
    }

    const suggestions = rankAndSlice(Array.from(map.values()), q, limit);
    return NextResponse.json({ resultCode: 200, resultMsg: 'Success', suggestions });
  } catch (error) {
    return NextResponse.json(
      { resultCode: 500, resultMsg: String(error), suggestions: [] },
      { status: 500 }
    );
  }
}
