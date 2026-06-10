FROM node:20-bookworm-slim AS deps

WORKDIR /app/server

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
ENV DATABASE_URL=mysql://user:password@127.0.0.1:3306/qingning_local_life

RUN corepack enable \
  && apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates openssl \
  && rm -rf /var/lib/apt/lists/*

COPY server/package.json server/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts

FROM deps AS build

COPY server/nest-cli.json server/tsconfig.json server/tsconfig.build.json ./
COPY server/src ./src
COPY server/prisma ./prisma
COPY server/uploads ./uploads

RUN pnpm build && pnpm prune --prod

FROM node:20-bookworm-slim AS runner

WORKDIR /app/server

ENV NODE_ENV=production
ENV PORT=3000

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates openssl \
  && rm -rf /var/lib/apt/lists/*

COPY --from=build --chown=node:node /app/server/package.json ./package.json
COPY --from=build --chown=node:node /app/server/node_modules ./node_modules
COPY --from=build --chown=node:node /app/server/dist ./dist
COPY --from=build --chown=node:node /app/server/prisma ./prisma
COPY --from=build --chown=node:node /app/server/uploads ./uploads

USER node

EXPOSE 3000

CMD ["node", "dist/main.js"]
