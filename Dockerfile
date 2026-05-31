# syntax=docker/dockerfile:1

FROM node:22-alpine AS builder

WORKDIR /usr/src/app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY tsconfig.json ./
COPY src src
RUN yarn build

FROM node:22-alpine

ENV NODE_ENV=production

RUN apk add --no-cache tini

WORKDIR /usr/src/app
RUN chown node:node .

USER node

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production
COPY --from=builder /usr/src/app/dist/ dist/

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/health').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["/sbin/tini", "--", "yarn", "start"]
