FROM node:16-alpine

RUN mkdir -p /usr/src/app && chown node:node /usr/src/app

USER node

COPY ./package-lock.json \
  ./package.json \
  /usr/src/app/
WORKDIR /usr/src/app
RUN npm ci

ENV NODE_ENV=production

COPY ./libs/shared/src/ /usr/src/app/libs/shared/src/
COPY ./src/ /usr/src/app/src/
COPY ./scripts/ /usr/src/app/scripts/
COPY ./type-declarations/ /usr/src/app/type-declarations/

COPY ./.nvmrc \
  ./nest-cli.json \
  ./ormconfig.js \
  ./tsconfig.base.json \
  ./tsconfig.declaration-files.json \
  ./tsconfig.build.json \
  /usr/src/app/

RUN npm run build:api

CMD ["npm", "run", "start:prod"]
