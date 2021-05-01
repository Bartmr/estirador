require('source-map-support/register');

if (process.env.NODE_ENV === 'production') {
  require('./dist/src/internals/environment/load-environment-variables');

  const {
    TYPEORM_ORMCONFIG_WITH_MIGRATIONS,
  } = require(`./dist/src/internals/databases/typeorm-ormconfig-with-migrations`);

  module.exports = [
    {
      ...TYPEORM_ORMCONFIG_WITH_MIGRATIONS[0],
      entities: ['dist/src/**/typeorm/*.entity.js'],
    },
  ];
} else if (process.env.NODE_ENV === 'development') {
  require('./src/internals/environment/load-environment-variables');

  const {
    TYPEORM_ORMCONFIG_WITH_MIGRATIONS,
  } = require(`./src/internals/databases/typeorm-ormconfig-with-migrations`);

  module.exports = [
    {
      ...TYPEORM_ORMCONFIG_WITH_MIGRATIONS[0],
      entities: ['src/**/typeorm/*.entity.ts'],
    },
  ];
} else {
  throw new Error(
    'typeorm-cli:unsupported-environment:' + process.env.NODE_ENV,
  );
}
