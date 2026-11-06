# Turning the portal on

Two things have to exist in Cloudflare before the portal works: somewhere to
keep the data, and a lock on the door. Both are free. Neither needs a
terminal. Expect about fifteen minutes.

**Nothing is broken while you do this.** The Worker is already deployed and
notices that neither exists: the guide serves exactly as before, the drivers
section hides itself because it is empty, and `/admin` answers with one line
saying it is not set up yet.

When you have finished both steps, send back the three values in bold and the
last change is a four-line edit on my side.

---

## Step 1 — somewhere to keep the data

1. Open the Cloudflare dashboard and pick your account.
2. In the left menu: **Storage & Databases** → **D1 SQL Database**.
3. **Create database**. Name it exactly:

       exploregh-data

   Leave the location on automatic.
4. Create it. The page that opens shows a **Database ID**, a long string of
   letters, numbers and hyphens. **Copy it.** That is the first value.

The ID is not a secret. It names the database; it does not open it. Only a
Worker in your own account can reach it.

Nothing to do about tables: the Worker creates them the first time it writes.

---

## Step 2 — the lock on the door

This is Cloudflare Access. It puts a sign-in page in front of `/admin` and
nowhere else. You get a six-digit code by email. There is no password to
invent, lose or share.

1. Left menu: **Zero Trust**. If you have never opened it, it asks you to pick
   a team name. Choose something short, say `somewherenice`. Your team domain
   then becomes:

       somewherenice.cloudflareaccess.com

   **That is the second value.** Take the free plan when it offers one; it
   covers fifty people and you need one.
2. **Access** → **Applications** → **Add an application** → **Self-hosted**.
3. Fill in:
   - Application name: `Somewhere Nice portal`
   - Session duration: `24 hours`
   - Subdomain `exploregh`, domain `niceoperation.com`, path `admin`
4. Add a second entry on the same application for path `admin/*`, so the
   pages behind it are covered too.
5. Next, to the policy:
   - Policy name: `Us`
   - Action: `Allow`
   - Include → **Emails** → type your own email address. Add anyone else who
     should get in, one per line.
6. Save. Back on the application's **Overview** tab there is an
   **Application Audience (AUD) Tag**, another long string. **Copy it.** That
   is the third value.

The AUD tag is not a secret either. It says which application a sign-in was
for, so a token minted for something else cannot be used here.

---

## Step 3 — send me three things

```
Database ID:     ....................
Team domain:     ........cloudflareaccess.com
AUD tag:         ....................
```

I uncomment four lines in `guide/wrangler.jsonc`, push, and the portal is
live at:

    https://exploregh.niceoperation.com/admin

---

## What you will see

**Traffic.** Visits a day for the last week, month or three months, and then
what guests actually opened: which places, which routes, which interests they
picked, which drivers they rang, and how far down the page they got. It
starts empty and fills from the day it goes live; it cannot show you the past.

**Drivers.** Add, edit, hide and delete. Saving puts a driver on the guide
within a minute. *Hide from guide* keeps the record and takes them off the
page, which is the right button when somebody is away for a month. Each
driver has a switch for **Do not print their number** — they keep their name,
car and routes on the page, and guests are told to ask reception.

## What it does not do

It does not edit the 73 places, the routes or the ground rules. Those are
still in the file and still go through me. If you want them in here too, say
so: it is the same shape of work, and this one was built first because it is
the one you asked for.

## If something goes wrong

- **`/admin` says it is not set up yet** — the three values are not in
  `wrangler.jsonc` yet, or the deploy that added them has not finished.
- **Cloudflare asks you to sign in over and over** — the application's path in
  step 2 does not match. It must cover `admin` *and* `admin/*`.
- **The portal loads but says there is no database** — the database ID is
  wrong, or the database was made in a different Cloudflare account.
- **A driver you added is not on the guide** — check *Show on the guide* is
  ticked. If it is, the page caches for sixty seconds; wait a minute and
  reload.
