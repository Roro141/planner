# Setting up reminders

Reminders are a notification on your phone and laptop when a task with a
time is due ("essay friday 6pm" pings you at 6pm). The code is in the app;
these steps connect it to Supabase. About 15 minutes, once.

Run every command in a terminal in this project folder.

## 1. Update the database

Needed for all the new features (repeats, focus timer, reminders), not just
reminders. Do this before deploying the new version of the app.

Supabase dashboard → **SQL Editor** → New query → paste all of
`supabase/schema.sql` → **Run**. It's safe to run again.

## 2. Make the notification keys

```
npx web-push generate-vapid-keys
```

It prints a **Public Key** and a **Private Key**. Keep this window open.
The private key is a secret: don't put it in the app or in git.

## 3. Give the app the public key

Add this line to `.env.local`, with your public key:

```
VITE_VAPID_PUBLIC_KEY=the-public-key
```

And on Vercel: **Settings → Environment Variables** → add
`VITE_VAPID_PUBLIC_KEY` with the same value → redeploy.

## 4. Connect the Supabase tool

```
npx supabase login
npx supabase link --project-ref YOUR-PROJECT-REF
```

`YOUR-PROJECT-REF` is the part before `.supabase.co` in your Supabase URL
(it's in `.env.local`).

## 5. Save the server secrets

Make up a long random password for the cron job:

```
node -e "console.log(crypto.randomUUID())"
```

Then save everything (one command, your own values):

```
npx supabase secrets set VAPID_PUBLIC_KEY=the-public-key VAPID_PRIVATE_KEY=the-private-key VAPID_SUBJECT=mailto:you@example.com CRON_SECRET=the-random-text
```

## 6. Deploy the reminder function

```
npx supabase functions deploy send-reminders --no-verify-jwt
```

(`--no-verify-jwt` because the cron job proves itself with `CRON_SECRET`
instead of a sign-in.)

## 7. Start the every-minute job

Copy all of `supabase/reminders-cron.sql` into the **SQL Editor**, replace
`YOUR-PROJECT-REF` and `YOUR-CRON-SECRET` there (not in the file, so the
secret never ends up in git), and run it.

## 8. Turn reminders on, on each device

- **iPhone** (iOS 16.4 or newer): open the site in Safari → Share → **Add to
  Home Screen**. Open the app from that icon, scroll to the bottom, tap
  **turn on reminders**, then **Allow**. If nothing shows up later: iPhone
  Settings → Notifications → Planner.
- **Laptop:** open the site, tap **turn on reminders** at the bottom, and
  allow notifications. On Windows, also check Settings → System →
  Notifications: your browser is switched on and Do Not Disturb is off.

## 9. Try it

Add a task due two or three minutes from now with a time, like
`test 3:45pm`. The notification should arrive within a minute of that time.

## If it doesn't work

- **Did the job run?** In the SQL Editor:
  `select status, return_message, start_time from cron.job_run_details order by start_time desc limit 5;`
- **What did the function say?** Dashboard → Edge Functions →
  send-reminders → Logs. A 401 means `CRON_SECRET` doesn't match the one in
  the cron job.
- **No "turn on reminders" link?** `VITE_VAPID_PUBLIC_KEY` isn't set (or the
  app wasn't redeployed after adding it), or on iPhone you're in Safari
  instead of the home-screen app.
- Reminders only go out for tasks with a time, and only once per time. Moving
  a task to a new time sends a new one.
