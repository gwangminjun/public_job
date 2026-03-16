import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { FilterPreset, Job, RecentJob } from '@/lib/types';

type LocalMigrationPayload = {
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

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as LocalMigrationPayload;
    const bookmarks = Array.isArray(body.bookmarks) ? body.bookmarks : [];
    const recentJobs = Array.isArray(body.recentJobs) ? body.recentJobs : [];
    const presets = Array.isArray(body.presets) ? body.presets : [];

    const admin = createSupabaseAdminClient();

    const allJobsMap = new Map<number, Job>();
    for (const job of bookmarks) {
      allJobsMap.set(job.recrutPblntSn, job);
    }
    for (const item of recentJobs) {
      allJobsMap.set(item.job.recrutPblntSn, item.job);
    }

    const allJobs = Array.from(allJobsMap.values());
    const jobRows = normalizeJobs(allJobs);

    if (jobRows.length > 0) {
      const { error: upsertJobsError } = await admin
        .from('job_posts')
        .upsert(jobRows, { onConflict: 'source,source_job_sn' });

      if (upsertJobsError) {
        return NextResponse.json(
          { ok: false, message: upsertJobsError.message, code: upsertJobsError.code },
          { status: 500 }
        );
      }
    }

    const sourceSns = allJobs.map((job) => job.recrutPblntSn);
    let postIdBySn = new Map<number, string>();

    if (sourceSns.length > 0) {
      const { data: postRows, error: postRowsError } = await admin
        .from('job_posts')
        .select('id, source_job_sn')
        .eq('source', 'data_go_kr')
        .in('source_job_sn', sourceSns);

      if (postRowsError) {
        return NextResponse.json(
          { ok: false, message: postRowsError.message, code: postRowsError.code },
          { status: 500 }
        );
      }

      postIdBySn = new Map((postRows || []).map((row) => [Number(row.source_job_sn), String(row.id)]));
    }

    const bookmarkRows = bookmarks
      .map((job) => ({ user_id: user.id, job_post_id: postIdBySn.get(job.recrutPblntSn) }))
      .filter((row): row is { user_id: string; job_post_id: string } => Boolean(row.job_post_id));

    if (bookmarkRows.length > 0) {
      const { error: bookmarkError } = await admin
        .from('user_bookmarks')
        .upsert(bookmarkRows, { onConflict: 'user_id,job_post_id' });

      if (bookmarkError) {
        return NextResponse.json(
          { ok: false, message: bookmarkError.message, code: bookmarkError.code },
          { status: 500 }
        );
      }
    }

    const { error: recentDeleteError } = await admin
      .from('user_recent_views')
      .delete()
      .eq('user_id', user.id);

    if (recentDeleteError) {
      return NextResponse.json(
        { ok: false, message: recentDeleteError.message, code: recentDeleteError.code },
        { status: 500 }
      );
    }

    const recentRows = recentJobs
      .slice(0, 10)
      .map((item) => ({
        user_id: user.id,
        job_post_id: postIdBySn.get(item.job.recrutPblntSn),
        viewed_at: item.viewedAt || new Date().toISOString(),
      }))
      .filter(
        (row): row is { user_id: string; job_post_id: string; viewed_at: string } => Boolean(row.job_post_id)
      );

    if (recentRows.length > 0) {
      const { error: recentInsertError } = await admin.from('user_recent_views').insert(recentRows);
      if (recentInsertError) {
        return NextResponse.json(
          { ok: false, message: recentInsertError.message, code: recentInsertError.code },
          { status: 500 }
        );
      }
    }

    const presetRows = presets
      .filter((preset) => Boolean(preset.name?.trim()))
      .map((preset) => ({
        user_id: user.id,
        name: preset.name.trim(),
        filters_json: preset.filters,
      }));

    if (presetRows.length > 0) {
      const { error: presetError } = await admin
        .from('user_filter_presets')
        .upsert(presetRows, { onConflict: 'user_id,name' });

      if (presetError) {
        return NextResponse.json(
          { ok: false, message: presetError.message, code: presetError.code },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      ok: true,
      migrated: {
        bookmarks: bookmarkRows.length,
        recentJobs: recentRows.length,
        presets: presetRows.length,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: String(error) },
      { status: 500 }
    );
  }
}
