import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { getDataGoApiKey } from '@/lib/server/dataGoApiKey';
import { sendSlackWebhookMessage } from '@/lib/server/slack';
import { Job } from '@/lib/types';

export const dynamic = 'force-dynamic';

const API_BASE_URL = 'https://apis.data.go.kr/1051000/recruitment';

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

  return jobs.map((job) => ({
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

function matchInstitution(job: Job, institutionName: string) {
  return (job.instNm || '').toLowerCase().includes(institutionName.toLowerCase().trim());
}

export async function POST(request: NextRequest) {
  const expectedSecret = process.env.CRON_SECRET?.trim();
  if (!expectedSecret) {
    return NextResponse.json({ ok: false, message: 'CRON_SECRET is not configured' }, { status: 500 });
  }

  const providedSecret = request.headers.get('x-cron-secret')?.trim();
  if (!providedSecret || providedSecret !== expectedSecret) {
    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  }

  const serviceKey = getDataGoApiKey();
  if (!serviceKey) {
    return NextResponse.json({ ok: false, message: 'DATA_GO_KR_API_KEY missing' }, { status: 500 });
  }

  const apiUrl = `${API_BASE_URL}/list?serviceKey=${serviceKey}&resultType=json&numOfRows=1000&pageNo=1`;
  const response = await fetch(apiUrl, { cache: 'no-store' });
  if (!response.ok) {
    return NextResponse.json({ ok: false, message: `External API error: ${response.status}` }, { status: 500 });
  }

  const data = await response.json();
  const jobs = Array.isArray(data.result) ? (data.result as Job[]) : [];
  const admin = createSupabaseAdminClient();

  if (jobs.length > 0) {
    await admin.from('job_posts').upsert(normalizeJobs(jobs), { onConflict: 'source,source_job_sn' });
  }

  const { data: rules, error: rulesError } = await admin
    .from('institution_watch_rules')
    .select('id, user_id, institution_name, active, last_checked_at')
    .eq('active', true);

  if (rulesError) {
    return NextResponse.json({ ok: false, message: rulesError.message }, { status: 500 });
  }

  const { data: targets, error: targetsError } = await admin
    .from('notification_targets')
    .select('id, user_id, channel, destination, active, verified')
    .eq('active', true)
    .eq('verified', true)
    .eq('channel', 'slack');

  if (targetsError) {
    return NextResponse.json({ ok: false, message: targetsError.message }, { status: 500 });
  }

  const { data: jobRows } = await admin
    .from('job_posts')
    .select('id, source_job_sn')
    .eq('source', 'data_go_kr')
    .in('source_job_sn', jobs.map((job) => job.recrutPblntSn));

  const jobIdBySn = new Map((jobRows || []).map((row) => [Number(row.source_job_sn), String(row.id)]));
  const targetMap = new Map<string, Array<{ id: string; destination: string }>>();

  for (const target of targets || []) {
    const bucket = targetMap.get(target.user_id) ?? [];
    bucket.push({ id: target.id, destination: target.destination });
    targetMap.set(target.user_id, bucket);
  }

  let sent = 0;
  let failed = 0;

  for (const rule of rules || []) {
    const matchedJobs = jobs.filter((job) => matchInstitution(job, rule.institution_name));
    const userTargets = targetMap.get(rule.user_id) ?? [];

    for (const job of matchedJobs) {
      for (const target of userTargets) {
        const idempotencyKey = `${rule.id}:${target.id}:${job.recrutPblntSn}`;

        const { error: logError } = await admin.from('notification_dispatch_logs').insert({
          user_id: rule.user_id,
          watch_rule_id: rule.id,
          target_id: target.id,
          job_post_id: jobIdBySn.get(job.recrutPblntSn) ?? null,
          status: 'queued',
          idempotency_key: idempotencyKey,
        });

        if (logError) {
          continue;
        }

        try {
          await sendSlackWebhookMessage(
            target.destination,
            `[Public Job Portal] ${rule.institution_name} 신규 공고: ${job.recrutPbancTtl}\n${job.instNm}\n${job.srcUrl || ''}`
          );

          await admin
            .from('notification_dispatch_logs')
            .update({ status: 'sent', sent_at: new Date().toISOString() })
            .eq('idempotency_key', idempotencyKey);
          sent += 1;
        } catch (error) {
          await admin
            .from('notification_dispatch_logs')
            .update({ status: 'failed', error_message: String(error) })
            .eq('idempotency_key', idempotencyKey);
          failed += 1;
        }
      }
    }

    await admin
      .from('institution_watch_rules')
      .update({ last_checked_at: new Date().toISOString() })
      .eq('id', rule.id);
  }

  return NextResponse.json({ ok: true, sent, failed, rules: (rules || []).length });
}
