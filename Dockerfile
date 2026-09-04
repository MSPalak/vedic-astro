# ---- deps ----
FROM node:24-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund

# ---- build ----
FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---- runtime ----
FROM node:24-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=4321

# Next standalone output (server + minimal node_modules trace).
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
# Swiss Ephemeris WASM + ephemeris data must be present at runtime.
COPY --from=build /app/node_modules/swisseph-wasm ./node_modules/swisseph-wasm

# Run unprivileged: the server only reads its bundle, never writes.
USER node

EXPOSE 4321
CMD ["node", "server.js"]
