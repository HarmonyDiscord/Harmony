# Runner
FROM docker.io/oven/bun:latest AS runner
WORKDIR /zenith/

COPY . ./

ENV NODE_ENV=production

RUN bun install --production --frozen-lockfile
RUN bun run build:bundle

RUN ls -la

CMD ["bun", "run", "start:dist"]
