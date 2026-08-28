<p align="center">
  <img src="./public/iplens-logo.svg" alt="IPLens" width="88">
</p>

<h1 align="center">IPLens</h1>

<p align="center">
  <i>Internal web analytics for IP Motion MC — traffic, campaigns, behavior and conversions in one place, self-hosted, no third-party trackers.</i>
</p>

<p align="center">
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
  <a href="https://github.com/umami-software/umami"><img src="https://img.shields.io/badge/based%20on-umami-lightgrey.svg" alt="Based on umami" /></a>
</p>

---

IPLens is built on [umami](https://github.com/umami-software/umami) (MIT). We run it ourselves
and develop our own features on top of it, so this repository is where our changes live — it is
not a mirror and it is expected to drift from upstream.

Anything we haven't changed still behaves exactly as documented upstream, so
[umami.is/docs](https://umami.is/docs/) remains the reference for product features: tracking
script setup, reports, teams, the data API, and so on. This README only covers what is specific
to running and developing IPLens.

---

## 🚀 Getting Started

Requirements: **Node 22**, **pnpm**, **Docker**. Nothing else — no API keys, no accounts, no
external services.

```bash
pnpm install
pnpm start:local
```

Then open <http://localhost:3000> and sign in with **admin** / **umami**.

That single command is idempotent and safe to re-run. On first use it writes a local `.env`
(generating an `APP_SECRET` for you), and on every run it starts PostgreSQL, waits for it to
become healthy, generates the Prisma client, and applies any pending migrations before starting
the dev server.

Only the database runs in Docker. The app itself runs natively so that edits hot-reload —
rebuilding a container per change would make the loop unusable.

**Ports.** The app serves on `3000`. PostgreSQL publishes on `54329` rather than the default
`5432`, because a development machine usually already has one running. If that still clashes,
set `DB_PORT` in `.env`; it moves both the published port and the connection string.

To stop the database when you're done:

```bash
docker compose -f docker-compose.local.yml down
```

---

## 🐳 Running the Production Image

`docker-compose.yml` builds the app image from this repository and runs it alongside PostgreSQL —
this is the deployment path, not the development one.

```bash
docker compose up -d --build
```

The app serves on `3900` and the database publishes on `54329`.

The image build runs `next build --webpack`. This is deliberate: Next.js 16 defaults to Turbopack,
which does not emit the `.next/standalone` output the runtime stage needs. The build also needs
more heap than the default, so the builder stage raises `NODE_OPTIONS` — allow Docker at least
**4 GB** of memory or the build will be killed partway through with no useful error.

---

## 📄 License

MIT, inherited from umami. The original copyright notice is retained in [LICENSE](./LICENSE);
please keep it there.
