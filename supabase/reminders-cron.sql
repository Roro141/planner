-- Starts the send-reminders function every minute. Run this once in the
-- Supabase dashboard (SQL Editor) AFTER deploying the function and setting
-- its secrets. Steps: docs/reminders-setup.md.
--
-- Replace the two placeholders first:
--   YOUR-PROJECT-REF  the part before .supabase.co in your project URL
--   YOUR-CRON-SECRET  the same text you saved as the CRON_SECRET secret

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Running this again replaces the job instead of adding a second one.
select cron.unschedule('send-reminders')
where exists (select 1 from cron.job where jobname = 'send-reminders');

select cron.schedule(
  'send-reminders',
  '* * * * *',
  $$
  select net.http_post(
    url := 'https://YOUR-PROJECT-REF.supabase.co/functions/v1/send-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', 'YOUR-CRON-SECRET'
    ),
    body := '{}'::jsonb
  );
  $$
);
