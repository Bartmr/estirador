FROM node:14-buster

ENV CI=true

COPY ./client-side/web-app/src/ /usr/src/app/client-side/web-app/src/
COPY ./client-side/web-app/scripts/ /usr/src/app/client-side/web-app/scripts/
COPY ./client-side/web-app/type-declarations/ /usr/src/app/client-side/web-app/type-declarations/

COPY ./libs/shared/ /usr/src/app/libs/shared/
COPY ./package.json ./package-lock.json /usr/src/app/

COPY ./client-side/web-app/.babelrc \
./client-side/web-app/.nvmrc \
./client-side/web-app/bootstrap-build-environment.js \
./client-side/web-app/codegen.yml \
./client-side/web-app/gatsby-*.js \
./client-side/web-app/package.json \
./client-side/web-app/package-lock.json \
./client-side/web-app/tsconfig.json \
./client-side/web-app/tsconfig.declaration-files.json \
./client-side/web-app/tsconfig.release.json /usr/src/app/client-side/web-app/

WORKDIR /usr/src/app

RUN npm ci

WORKDIR /usr/src/app/client-side/web-app

RUN npm ci

ENV NODE_ENV=production

ARG HOST_URL
ARG MAIN_API_URL

ENV HOST_URL ${HOST_URL}
ENV MAIN_API_URL ${MAIN_API_URL}

RUN npm run build

CMD npm run serve
