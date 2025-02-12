FROM node:20-slim AS build
ARG ODBC_ENABLED=false

RUN apt-get update && apt-get install -y \
    python3 make g++ python3-dev \
    && ( \
    if [ "$ODBC_ENABLED" = "true" ] ; \
    then \
    echo "Installing ODBC build dependencies." 1>&2 ;\
    apt-get install -y unixodbc-dev ;\
    npm install -g node-gyp ;\
    fi\
    ) \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /server

COPY . .
RUN yarn install --production

ENV NODE_ENV production
ENV SQLPAD_DB_PATH /var/lib/sqlpad

CMD ["node", "server.js"]