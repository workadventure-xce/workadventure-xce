# protobuf build
FROM node:14-buster-slim as builder
WORKDIR /usr/src
COPY messages .
RUN yarn install && yarn proto

# webpack build
FROM node:14-buster-slim as builder2
WORKDIR /usr/src
COPY front/yarn.lock front/package.json ./
RUN yarn install

COPY front .
COPY --from=builder /usr/src/generated src/Messages/generated
ENV NODE_ENV=production

ARG ADMIN_URL=admin.$BASE_DOMAIN
ARG API_URL=pusher.$BASE_DOMAIN
ARG BASE_DOMAIN=workadventure.localhost
ARG JITSI_PRIVATE_MODE
ARG JITSI_URL
ARG START_ROOM_URL
ARG STUN_SERVER
ARG TURN_PASSWORD
ARG TURN_SERVER
ARG TURN_USER
ARG UPLOADER_URL=uploader.$BASE_DOMAIN
ARG DEBUG_MODE
ARG MAX_PER_GROUP

RUN ./templater.sh
RUN API_URL=$API_URL DEBUG_MODE=$DEBUG_MODE UPLOADER_URL=$UPLOADER_URL ADMIN_URL=$ADMIN_URL START_ROOM_URL=$START_ROOM_URL \
    JITSI_URL=$JITSI_URL JITSI_PRIVATE_MODE=$JITSI_PRIVATE_MODE \
    STUN_SERVER=$STUN_SERVER TURN_SERVER=$TURN_SERVER TURN_USER=$TURN_USER TURN_PASSWORD=$TURN_PASSWORD MAX_PER_GROUP=$MAX_PER_GROUP \
    yarn run build

# final production image
FROM nginx:mainline-alpine
COPY front/nginx-vhost.conf /etc/nginx/conf.d/default.conf
COPY --from=builder2 /usr/src/dist /usr/share/nginx/html
