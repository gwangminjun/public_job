insert into storage.buckets (id, name, public)
values ('grandma-videos', 'grandma-videos', true)
on conflict (id) do update
set public = excluded.public;
