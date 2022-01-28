# Breaking Changes

> This file tracks breaking changes that need to be resolved when updating your project, along with instructions on how to do it.

- Forked `typeorm` and `@nestjs/typeorm`
  - Do a find and replace for `'typeorm'`, `"typeorm"`, `typeorm:`, `'@nestjs/typeorm'`, `"@nestjs/typeorm"`, `@nestjs/typeorm:` and replace with `typeorm-bartmr` and `nestjs-typeorm-bartmr`
- Updated Node version
  - before updating
    - run `npm run reset-repository`
  - while updating
    - run `nvm use`
    - run `npm run install:all`
- `card-color-{color name}` are now just `card-{color name}`
