# syntax=docker/dockerfile:1

FROM node:16-alpine AS builder

WORKDIR /usr/src/app
COPY ["package.json", "yarn.lock", "./"]
RUN yarn install --frozen-lockfile
COPY tsconfig*.json ./
COPY src src
RUN npm install -g typescript && yarn build

FROM node:16-alpine

ENV NODE_ENV=production
RUN apk add --no-cache tini
WORKDIR /usr/src/app
RUN chown node:node .
USER node
COPY package.json ./
RUN yarn install
COPY --from=builder /usr/src/app/dist/ dist/
# there is an issue with handling environment variables and credientials
#COPY .data .data

EXPOSE 3000
CMD ["/sbin/tini", "--", "yarn", "start"]
