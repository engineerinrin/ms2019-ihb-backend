FROM node:8.12.0-alpine

ENV APP_ROOT=/app

WORKDIR ${APP_ROOT}

RUN apk --update add tzdata && \
    cp /usr/share/zoneinfo/Asia/Tokyo /etc/localtime && \
    apk del tzdata && \
    rm -rf /var/cache/apk/*