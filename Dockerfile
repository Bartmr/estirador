FROM node:14-alpine

COPY ./libs/ /usr/src/app/libs/
COPY ./src/ /usr/src/app/src/
COPY ./scripts/ /usr/src/app/scripts/
COPY ./type-declarations/ /usr/src/app/type-declarations/

COPY ./.nvmrc \
./nest-cli.json \
./ormconfig.js \
./package-lock.json \
./package.json \
./tsconfig.base.json \
./tsconfig.declaration-files.json \
./tsconfig.build.json /usr/src/app/

WORKDIR /usr/src/app

RUN npm ci

ENV NODE_ENV=production

RUN npm run build:api

CMD npm run start:prod
