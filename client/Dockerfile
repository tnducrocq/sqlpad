FROM node:20-slim AS build

WORKDIR /client

COPY . .
RUN yarn install
RUN yarn build

FROM nginx:alpine
COPY /build /usr/share/nginx/html
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]