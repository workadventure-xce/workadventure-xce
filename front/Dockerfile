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

# Removing the iframe.html file from the final image as this adds a XSS attack.
# iframe.html is only in dev mode to circumvent a limitation
RUN rm dist/iframe.html

ARG PUSHER_URL=/pusher
ARG ADMIN_URL=/admin
ARG MAPS_URL=/maps
ARG UPLOADER_URL=/uploader
ARG START_ROOM_URL
ARG JITSI_PRIVATE_MODE
ARG JITSI_URL
ARG STUN_SERVER
ARG TURN_SERVER
ARG TURN_USER
ARG TURN_PASSWORD
ARG MAX_USERNAME_LENGTH
ARG MAX_PER_GROUP
ARG DISABLE_NOTIFICATIONS
ARG SKIP_RENDER_OPTIMIZATIONS
ARG DISPLAY_TERMS_OF_USE

RUN ./templater.sh
RUN PUSHER_URL=$PUSHER_URL ADMIN_URL=$ADMIN_URL MAPS_URL=$MAPS_URL UPLOADER_URL=$UPLOADER_URL START_ROOM_URL=$START_ROOM_URL \
    JITSI_URL=$JITSI_URL JITSI_PRIVATE_MODE=$JITSI_PRIVATE_MODE \
    STUN_SERVER=$STUN_SERVER TURN_SERVER=$TURN_SERVER TURN_USER=$TURN_USER TURN_PASSWORD=$TURN_PASSWORD \
    MAX_USERNAME_LENGTH=$MAX_USERNAME_LENGTH MAX_PER_GROUP=$MAX_PER_GROUP DISABLE_NOTIFICATIONS=$DISABLE_NOTIFICATIONS \
    SKIP_RENDER_OPTIMIZATIONS=$SKIP_RENDER_OPTIMIZATIONS DISPLAY_TERMS_OF_USE=$DISPLAY_TERMS_OF_USE \
    yarn run build

# final production image
FROM nginx:mainline-alpine
COPY front/nginx-vhost.conf /etc/nginx/conf.d/default.conf
COPY --from=builder2 /usr/src/dist /usr/share/nginx/html
