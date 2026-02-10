import { NextRequest, NextResponse } from 'next/server';
import { Job, JobListResponse } from '@/lib/types';
import { differenceInCalendarDays, parseISO } from 'date-fns';

const API_BASE_URL = 'https://apis.data.go.kr/1051000/recruitment';
const SERVICE_KEY = process.env.DATA_GO_KR_API_KEY || '';

// In-memory cache
let cachedJobs: Job[] = [];
let lastFetchTime = 0;
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

// Helper: Calculate D-day
function calculateDday(endDateStr: string): number | undefined {
  if (!endDateStr) return undefined;
  
  // Format: YYYYMMDD -> YYYY-MM-DD
  const formattedDate = `${endDateStr.slice(0, 4)}-${endDateStr.slice(4, 6)}-${endDateStr.slice(6, 8)}`;
  const endDate = parseISO(formattedDate);
  const today = new Date();
  
  return differenceInCalendarDays(endDate, today);
}

// Helper: Check if job is ongoing
function isOngoing(endDateStr: string): boolean {
  if (!endDateStr) return true; // No end date = ongoing (usually)
  const dDay = calculateDday(endDateStr);
  return dDay !== undefined && dDay >= 0;
}

export async function GET(request: NextRequest) {
  try {
    // 환경변수 체크
    if (!SERVICE_KEY) {
      return NextResponse.json(
        { resultCode: 500, resultMsg: 'API key not configured', result: [] },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    
    // Filter params
    const keyword = searchParams.get('keyword') || '';
    const regions = searchParams.get('regions')?.split(',') || [];
    const hireTypes = searchParams.get('hireTypes')?.split(',') || [];
    const recruitTypes = searchParams.get('recruitTypes')?.split(',') || [];
    const ncsTypes = searchParams.get('ncsTypes')?.split(',') || [];
    const educationTypes = searchParams.get('educationTypes')?.split(',') || [];
    const onlyOngoing = searchParams.get('onlyOngoing') === 'true';
    const sort = searchParams.get('sort') || 'latest';

    // 1. Check Cache & Fetch if needed
    const now = Date.now();
    if (cachedJobs.length === 0 || now - lastFetchTime > CACHE_DURATION) {
      console.log('Fetching fresh data from external API...');
      // Fetch a large batch to perform server-side filtering
      const apiUrl = `${API_BASE_URL}/list?serviceKey=${SERVICE_KEY}&resultType=json&numOfRows=1000&pageNo=1`;
      
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`External API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Process and Cache data
      if (data.result && Array.isArray(data.result)) {
        cachedJobs = data.result.map((job: Job) => ({
          ...job,
          decimalDay: calculateDday(job.pbancEndYmd),
          ongoingYn: isOngoing(job.pbancEndYmd) ? 'Y' : 'N'
        }));
        lastFetchTime = now;
      } else {
         // If API returns weird structure or empty
         cachedJobs = [];
      }
    }

    // 2. Apply Filters
    let filteredJobs = [...cachedJobs];

    if (onlyOngoing) {
      filteredJobs = filteredJobs.filter(job => job.ongoingYn === 'Y');
    }

    if (keyword) {
      const lowerKeyword = keyword.toLowerCase();
      filteredJobs = filteredJobs.filter(job => 
        job.recrutPbancTtl?.toLowerCase().includes(lowerKeyword) || 
        job.instNm?.toLowerCase().includes(lowerKeyword)
      );
    }

    if (regions.length > 0) {
      filteredJobs = filteredJobs.filter(job => 
        regions.some(r => job.workRgnNmLst?.includes(r))
      );
    }

    if (hireTypes.length > 0) {
      filteredJobs = filteredJobs.filter(job => 
        hireTypes.some(h => job.hireTypeNmLst?.includes(h))
      );
    }

    if (recruitTypes.length > 0) {
      filteredJobs = filteredJobs.filter(job => 
        recruitTypes.some(r => job.recrutSeNm?.includes(r))
      );
    }

    if (ncsTypes.length > 0) {
      filteredJobs = filteredJobs.filter(job => 
        ncsTypes.some(n => job.ncsCdNmLst?.includes(n))
      );
    }

    if (educationTypes.length > 0) {
      filteredJobs = filteredJobs.filter(job => 
        educationTypes.some(e => job.acbgCondNmLst?.includes(e))
      );
    }

    // 3. Apply Sorting
    filteredJobs.sort((a, b) => {
      switch (sort) {
        case 'deadline': {
          // Close deadline first (ascending D-day)
          // Handle undefined/null D-days (put them last)
          const dDayA = a.decimalDay ?? 9999;
          const dDayB = b.decimalDay ?? 9999;
          return dDayA - dDayB;
        }
        
        case 'personnel':
          // Higher recruit count first
          return (b.recrutNope || 0) - (a.recrutNope || 0);
          
        case 'latest':
        default:
          // Newest registration first (descending start date)
          return (b.pbancBgngYmd || '').localeCompare(a.pbancBgngYmd || '');
      }
    });

    // 4. Pagination
    const totalCount = filteredJobs.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedJobs = filteredJobs.slice(startIndex, endIndex);

    const response: JobListResponse = {
      resultCode: 200,
      resultMsg: 'Success',
      totalCount: totalCount,
      result: paginatedJobs
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Jobs API error:', error);
    return NextResponse.json(
      { resultCode: 500, resultMsg: String(error), result: [], totalCount: 0 },
      { status: 500 }
    );
  }
}

