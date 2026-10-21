// Sends a push notification for every timed task that has just come due.
//
// Runs on Supabase Edge Functions (Deno), started every minute by pg_cron
// (see supabase/reminders-cron.sql). Setup steps: docs/reminders-setup.md.
//
// Secrets it needs (Supabase dashboard → Edge Functions → Secrets):
//   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY  the notification key pair
//   VAPID_SUBJECT                        "mailto:" + your email
//   CRON_SECRET                          any long random text; the cron job sends it
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided automatically.

import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

// Tasks that came due longer ago than this are skipped, so turning reminders
// on (or the job being down for a while) doesn't send a pile of old ones.
const MAX_LATE_MS = 30 * 60_000;

Deno.serve(async (request) => {
  if (request.headers.get("x-cron-secret") !== Deno.env.get("CRON_SECRET")) {
    return new Response("not allowed", { status: 401 });
  }

  webpush.setVapidDetails(
    Deno.env.get("VAPID_SUBJECT")!,
    Deno.env.get("VAPID_PUBLIC_KEY")!,
    Deno.env.get("VAPID_PRIVATE_KEY")!,
  );

  // The service role key skips row-level security: this job works for every
  // user. It never leaves the server.
  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const now = new Date();

  // Claim the due tasks by stamping reminded_at first. Only rows that were
  // still unstamped come back, so two overlapping runs can't both send one.
  const { data: tasks, error } = await db
    .from("tasks")
    .update({ reminded_at: now.toISOString() })
    .eq("has_time", true)
    .is("completed_at", null)
    .is("deleted_at", null)
    .is("reminded_at", null)
    .lte("due_at", now.toISOString())
    .gt("due_at", new Date(now.getTime() - MAX_LATE_MS).toISOString())
    .select("id, user_id, title, due_at");

  if (error) return new Response(error.message, { status: 500 });
  if (!tasks?.length) return Response.json({ sent: 0 });

  const userIds = [...new Set(tasks.map((t) => t.user_id))];
  const { data: subscriptions } = await db
    .from("push_subscriptions")
    .select("id, user_id, endpoint, p256dh, auth")
    .in("user_id", userIds);

  let sent = 0;
  const gone: string[] = [];

  for (const task of tasks) {
    const payload = JSON.stringify({
      title: task.title,
      body: "due now",
      url: "/",
      tag: `task-${task.id}`,
    });

    for (const sub of subscriptions ?? []) {
      if (sub.user_id !== task.user_id) continue;
      try {
        await webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, payload);
        sent++;
      } catch (err) {
        // 404/410: the device unsubscribed or the app was removed. Forget it.
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) gone.push(sub.id);
      }
    }
  }

  if (gone.length) await db.from("push_subscriptions").delete().in("id", gone);
  return Response.json({ sent, tasks: tasks.length, removed: gone.length });
});
