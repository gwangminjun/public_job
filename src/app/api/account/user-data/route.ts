import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { FilterPreset, Job, RecentJob } from '@/lib/types';

type UserDataResponse = {
  bookmarks: Job[];
  recentJobs: RecentJob[];
  presets: FilterPreset[];
};

type SyncPayload = {
  bookmarks?: Job[];
  recentJobs?: RecentJob[];
  presets?: FilterPreset[];
};

type JobPostUpsertRow = {
  source: string;
  source_job_sn: number;
  institution_name: string;
  title: string;
  ncs_text: string;
  hire_type_text: string;
  work_region_text: string;
  recruit_type_text: string;
  recruit_count: number | null;
  start_ymd: string;
  end_ymd: string;
  ongoing_yn: string;
  src_url: string;
  raw_payload: Job;
  last_seen_at: string;
};

function normalizeJobs(jobs: Job[]): JobPostUpsertRow[] {
  const now = new Date().toISOString();

  return jobs
    .filter((job) => Number.isFinite(job.recrutPblntSn))
    .map((job) => ({
      source: 'data_go_kr',
      source_job_sn: job.recrutPblntSn,
      institution_name: job.instNm || '',
      title: job.recrutPbancTtl || '',
      ncs_text: job.ncsCdNmLst || '',
      hire_type_text: job.hireTypeNmLst || '',
      work_region_text: job.workRgnNmLst || '',
      recruit_type_text: job.recrutSeNm || '',
      recruit_count: Number.isFinite(job.recrutNope) ? job.recrutNope : null,
      start_ymd: job.pbancBgngYmd || '',
      end_ymd: job.pbancEndYmd || '',
      ongoing_yn: job.ongoingYn || 'Y',
      src_url: job.srcUrl || '',
      raw_payload: job,
      last_seen_at: now,
    }));
}

async function requireUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function GET() {
  try {
    const user = await requireUser();

    if (!user) {
      return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
    }

    const admin = createSupabaseAdminClient();

    const [bookmarkRes, recentRes, presetRes] = await Promise.all([
      admin
        .from('user_bookmarks')
        .select('created_at, job_posts!inner(raw_payload)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      admin
        .from('user_recent_views')
        .select('viewed_at, job_posts!inner(raw_payload)')
        .eq('user_id', user.id)
        .order('viewed_at', { ascending: false })
        .limit(10),
      admin
        .from('user_filter_presets')
        .select('id, name, filters_json, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
    ]);

    if (bookmarkRes.error || recentRes.error || presetRes.error) {
      const message = bookmarkRes.error?.message || recentRes.error?.message || presetRes.error?.message || 'Unknown error';
      return NextResponse.json({ ok: false, message }, { status: 500 });
    }

    const bookmarks: Job[] = (bookmarkRes.data || []).map((row) => {
      const relation = row.job_posts as { raw_payload: Job } | { raw_payload: Job }[];
      return Array.isArray(relation) ? relation[0]?.raw_payload : relation?.raw_payload;
    }).filter(Boolean) as Job[];

    const recentJobs: RecentJob[] = (recentRes.data || []).map((row) => {
      const relation = row.job_posts as { raw_payload: Job } | { raw_payload: Job }[];
      const job = Array.isArray(relation) ? relation[0]?.raw_payload : relation?.raw_payload;
      return job ? { job, viewedAt: row.viewed_at } : null;
    }).filter(Boolean) as RecentJob[];

    const presets: FilterPreset[] = (presetRes.data || []).map((row) => ({
      id: row.id,
      name: row.name,
      filters: row.filters_json,
      createdAt: row.created_at,
    }));

    const payload: UserDataResponse = { bookmarks, recentJobs, presets };
    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();

    if (!user) {
      return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as SyncPayload;
    const bookmarks = Array.isArray(body.bookmarks) ? body.bookmarks : [];
    const recentJobs = Array.isArray(body.recentJobs) ? body.recentJobs : [];
    const presets = Array.isArray(body.presets) ? body.presets : [];

    const admin = createSupabaseAdminClient();

    const allJobsMap = new Map<number, Job>();
    for (const job of bookmarks) allJobsMap.set(job.recrutPblntSn, job);
    for (const item of recentJobs) allJobsMap.set(item.job.recrutPblntSn, item.job);
    const allJobs = Array.from(allJobsMap.values());

    const jobRows = normalizeJobs(allJobs);
    if (jobRows.length > 0) {
      const { error: jobError } = await admin
        .from('job_posts')
        .upsert(jobRows, { onConflict: 'source,source_job_sn' });

      if (jobError) {
        return NextResponse.json({ ok: false, message: jobError.message }, { status: 500 });
      }
    }

    const sns = allJobs.map((job) => job.recrutPblntSn);
    const { data: postRows, error: postError } = sns.length > 0
      ? await admin
          .from('job_posts')
          .select('id, source_job_sn')
          .eq('source', 'data_go_kr')
          .in('source_job_sn', sns)
      : { data: [], error: null };

    if (postError) {
      return NextResponse.json({ ok: false, message: postError.message }, { status: 500 });
    }

    const postIdBySn = new Map((postRows || []).map((row) => [Number(row.source_job_sn), String(row.id)]));

    await admin.from('user_bookmarks').delete().eq('user_id', user.id);
    await admin.from('user_recent_views').delete().eq('user_id', user.id);
    await admin.from('user_filter_presets').delete().eq('user_id', user.id);

    const bookmarkRows = bookmarks
      .map((job) => ({ user_id: user.id, job_post_id: postIdBySn.get(job.recrutPblntSn) }))
      .filter((row): row is { user_id: string; job_post_id: string } => Boolean(row.job_post_id));

    if (bookmarkRows.length > 0) {
      const { error } = await admin.from('user_bookmarks').insert(bookmarkRows);
      if (error) {
        return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
      }
    }

    const recentRows = recentJobs
      .slice(0, 10)
      .map((item) => ({
        user_id: user.id,
        job_post_id: postIdBySn.get(item.job.recrutPblntSn),
        viewed_at: item.viewedAt || new Date().toISOString(),
      }))
      .filter((row): row is { user_id: string; job_post_id: string; viewed_at: string } => Boolean(row.job_post_id));

    if (recentRows.length > 0) {
      const { error } = await admin.from('user_recent_views').insert(recentRows);
      if (error) {
        return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
      }
    }

    const presetRows = presets.map((preset) => ({
      user_id: user.id,
      name: preset.name,
      filters_json: preset.filters,
    }));

    if (presetRows.length > 0) {
      const { error } = await admin.from('user_filter_presets').insert(presetRows);
      if (error) {
        return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}
