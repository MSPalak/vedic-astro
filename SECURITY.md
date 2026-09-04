# Security

## Posture

- **Security headers on every response** (`next.config.mjs`): strict CSP
  (self + Google Fonts + Supabase only, no third-party scripts),
  `frame-ancestors 'none'`, nosniff, HSTS, minimal Permissions-Policy,
  framework header disabled.
- **Rate limiting** (`lib/server/ratelimit.ts`): per-IP sliding window on
  every public endpoint — chart 30/min, match 20/min, panchang 30/min,
  geocode 60/min, ask 10/min, palm 6/min — protecting CPU and AI spend.
  In-process scope; move to Redis if scaling past one instance.
- **Strict input validation** (`lib/server/validate.ts`): real-date checks,
  coordinate bounds, timezone character allow-list, control-character
  stripping, length caps on names/questions/history, request body size caps
  on AI endpoints, image type/size allow-list for palm uploads.
- **Database**: Supabase with Row Level Security — users can only read and
  write their own rows (`db/schema.sql`); only the public anon key ships to
  the client. No service-role key exists anywhere in this codebase.
- **Secrets**: only via environment variables; `.env*` is git-ignored; the
  Anthropic key is server-side only.
- **Container**: multi-stage build, runs as the unprivileged `node` user,
  no build tooling in the runtime image.
- **AI endpoints**: system prompts constrain scope; user text is data, not
  instructions; medical/legal/financial directives are declined by design;
  palm images are processed in-memory and never written to disk.

## Accepted risks

- `postcss` advisories inside Next 15's bundled tooling (fix requires the
  Next 16 major): build-time only — this app never processes untrusted CSS
  or source maps. Revisit at the Next 16 upgrade.

## Reporting

Open a GitHub issue on the repository, or contact the owner directly.
Please do not publish exploits before a fix ships.
