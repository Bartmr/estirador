FROM node:16-buster

COPY ./client-side/web-app/src/ /usr/src/app/client-side/web-app/src/

COPY ./libs/shared/ /usr/src/app/libs/shared/
COPY ./package.json ./package-lock.json /usr/src/app/

COPY ./client-side/web-app/.babelrc \ 
  ./client-side/web-app/.nvmrc \
  ./client-side/web-app/load-build-environment.js \
  ./client-side/web-app/gatsby-*.js \
  ./client-side/web-app/package.json \
  ./client-side/web-app/package-lock.json \
  ./client-side/web-app/tsconfig.json \
  ./client-side/web-app/tsconfig.typecheck.json /usr/src/app/client-side/web-app/

WORKDIR /usr/src/app

RUN npm ci

WORKDIR /usr/src/app/client-side/web-app

RUN npm ci

ARG HOST_URL
ARG MAIN_API_URL

ENV GATSBY_HOST_URL ${HOST_URL}
ENV GATSBY_MAIN_API_URL ${MAIN_API_URL}

RUN npm run build:ci

CMD npm run serve
