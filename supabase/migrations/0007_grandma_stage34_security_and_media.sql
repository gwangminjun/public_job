alter table grandma_guestbook
  add column if not exists ip_hash text;

alter table grandma_config
  add column if not exists id int,
  add column if not exists celebration_video_title text,
  add column if not exists celebration_video_url text;

update grandma_config
set id = 1
where id is null;

alter table grandma_config
  alter column id set default 1;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'grandma_config_id_check'
  ) then
    alter table grandma_config
      add constraint grandma_config_id_check check (id = 1);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'grandma_config_pkey'
  ) then
    alter table grandma_config
      add constraint grandma_config_pkey primary key (id);
  end if;
end $$;

update grandma_config
set celebration_video_title = coalesce(celebration_video_title, '축하 영상')
where celebration_video_title is null;
