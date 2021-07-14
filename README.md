## Setting up a new project

- Clone this repository and rename the newly created directory with the name of your project
- Point the terminal to the root directory of this new project
- Run `git remote remove origin` to remove any unnecessary branches that came with the boilerplate repository and detach the new project from said repository
- Run `git remote add origin <project repository url>` to start pushing changes to your new project's repository
- Remove the `CONTRIBUTING.md` and `LICENSE` files, and also change the `license` field in `package.json`
- **Make sure you're using the recommended NodeJS version**
  - There's an `.nvmrc` file in the root of the project, so you can call `nvm use` in the terminal.
  - If you want `nvm` to switch to the recommended version automatically when switching directories, [follow `nvm`'s instructions here](https://github.com/nvm-sh/nvm#deeper-shell-integration)
- Run `npm run install:all`
- (Optional) hook the `precommit` script in `package.json` to your Git pre-commit hook
- Write down the project name and other details in `libs/shared/src/project-details.ts`
- Change the names of the services in `infrastructure/docker-compose.yml` and `infrastructure/docker-compose.dev.yml`, so you don't end up using your other projects services that have the same name when you are using this project's _docker-compose_
  - Example: rename `postgres_estirador` to `postgres_my_project`
- Start the project's infrastructure by running `docker-compose -f infrastructure/docker-compose.yml -f infrastructure/docker-compose.dev.yml up`
- Generate the first database migration by running `NODE_ENV=development npm run typeorm migration:generate -- -- -n FirstMigration --pretty`
- Add `await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');` in the first line of the first database migration `up()` method, in order for the database to be able to generate `uuid`s
- Import and place the newly generated migration in the `ALL_MIGRATIONS` array at `src/internals/databases/all-migrations.ts`, like this:

  ```typescript
  import { FirstMigration1625260282582 } from './migrations/1625260282582-FirstMigration';

  export const ALL_MIGRATIONS = [FirstMigration1625260282582];
  ```

- **Done**

## CI pipelines:

- Set the `CI` environment variable to `true` so the build process can detect that it's running in a CI pipeline

## Updating the project's boilerplate

To update the project's boilerplate, just run `update-project-boilerplate.sh` and input the _Git_ repository URL of the boilerplate your project is based on. In this case `https://github.com/Bartmr/estirador.git`

You can also use `force-update-project-boilerplate.sh` if you want previously rejected updates to appear again: this script will merge all the content from the boilerplate into the project without considering the _git_ commit history.

## How to extend Estirador and create a similar updatable boilerplate for my company?

- Just create a new repository following the instructions above on how to setup a new project, and do the changes you need to accommodate your company's requirements. That's it. It is now your company's own _Estirador_. Now when you create a project from it, remember to input your company's boilerplate _git_ repository URL instead of the official _Estirador_ URL. Also remember to keep your company's own boilerplate updated with _Estirador_'s by running the same update script in your company's boilerplate, but targeted to _Estirador_'s repository URL.

- _Advanced_: you can always start a new updatable boilerplate from scratch (and I mean from scratch: no actual code) and have it for anything that is commitable to _Git_: from a server boilerplate in _Go_ to your own _Jupyter_ notebook environment that has a specific structure. What gives the boilerplate it's "updatable" properties is the `./update-project-boilerplate.sh` file. The rest of this project is most of my expertise, solutions and foresight for creating scalable full-stack projects in no time.

> Estirador exists to introduce companies to a more stable and predictable methodology of reusing and storing code, not as a framework or package with a fixed set of rules

## Development

### Start development environment

- `npm run install:all`
- Start your project's infrastructure (example: databases, Redis, etc.)
  - `docker-compose -f infrastructure/docker-compose.yml -f infrastructure/docker-compose.dev.yml up`
- Seed the development database with sample data by running `NODE_ENV=development npm run seed`
- Start the server with `npm run start:dev`, or `npm run start:debug` if you want to debug the API in the Chrome Developer Tools
- To run the web app:
  - `cd client-side/web-app`
  - `npm run develop`

### Useful Commands

> Before running any of these commands, you need to set an environment first by prefixing the command with `NODE_ENV=<development | test>`.

This is in order to avoid running some of these commands in a production environment, even if it has no `NODE_ENV` set.

#### Database operations:

- **Seed data**: `npm run seed`
- **Tear down databases**: `npm run tear-down-databases`

#### TypeORM:

_Typeorm_ entities should always be placed in directories named `typeorm` and have their file name ending in `.entity.ts` in order to be detected by the _Typeorm CLI_.

**Newly created migrations should be imported and placed in `all-migrations.ts` files in order to run.**

- **Generate migration**: `npm run typeorm migration:generate -- -- --pretty -n MigrationName`
- **Create empty migration**: `npm run typeorm migration:create -- -- -n MigrationName`
- **Run migrations**: `npm run typeorm migration:run`
- **Revert last migration**: `npm run typeorm migration:revert`
- **Any other TypeORM command**: `npm run typeorm {command} -- -- --{argument}`

### Automatically document endpoints for Swagger:

- Place your _DTO_ classes inside files ending in `.dto.ts`. NestJS compiler plugins will take it from here.

### Creating background jobs:

In order for a background job to run in a separate process and be compiled in a separate file from the server code, just have its file name end in `.job.ts`. The job function should also be wrapped around `prepareJob()` or `prepareAndRunJob()` from `src/internals/jobs/run-job`. These wrapper functions do the usual setup like loading environment variables, logging and error handling.

### Sharing your development environment with others:

- Shut down all your services
- Set up [Ngrok](https://ngrok.com/)
- Set up your services in `~/.ngrok2/ngrok.yml` by adding:

```yml
tunnels:
  service_1:
    addr: 3000
    proto: http
    bind-tls: true # Forces HTTPS only tunneling
  service_2:
    addr: 8000
    proto: http
    bind-tls: true # Forces HTTPS only tunneling
```

- Run `<place where ngrok is installed>/ngrok start --all`
- Remember to update the URLs in your services configuration files in order to match the URLs exposed by Ngrok
- Start your services
- Share the Ngrok URLs with whoever asked to try your app

### Commiting

- Frontend apps load configurations depending on the build type they are running. If they are running a development build, they use configurations from `__config.debug`, else they use the ones from `__config.release`. Since the precommit hooks build all apps before continuing the commit, you can duplicate `__config.debug` on each frontend project and name it `__config.release`, since most configurations are build type agnostic.

### When developing

- Read about **validations** here: <https://github.com/Bartmr/not-me>
- **Avoid configurations that are tied to the build type** (example: values and configurations that use `NODE_ENV`).
- **Do not access environment variables directly** (the linter will problably stop you from doing that). Use the `EnvironmentVariablesService` to access these variables. This service is responsible for parsing and validating all environment variables that are used.
- **Always use custom repositories** In order to **enforce the use of the custom logic implemented in each repository** _(like auditing rows changes when extending `AuditedEntityRepository`)_ and to make sure that **entities have all their required fields filled**, always use custom repositories, by calling `(connection or manager).getCustomRepository(CustomRepositoryClass)`.
  - **As a rule of thumb**, if you're using the entity class as a value, or using it's constructor, you're problably doing it wrong and you should use or augment your entity's custom repository.
- **DTOs should NOT have methods.** There is currently a problem with reflection and class instances: imagine you want to self-document an endpoint by using Swagger: you annotate a _DTO_ class properties with Swagger decorators, and then set the body argument type in the controller method with said _DTO_ class. The real type that is going to come from that argument is not going to be an instance of the _DTO_ class but an Object instance / object literal with the same properties (but not the methods) as the DTO class. This is because we use a validation mechanism that only runs on runtime and outputs object literals with the validated values. Setting something like `class-transformer` would bring new problems regarding the _type safety_ between the class properties and the decorators annotating them. So this seems to be the more flexible choice. This body argument is then going to circulate deeper in other parts of the app, like services and other functions. **That is why you should avoid using `instanceof` on values that problably came from outside the API**, as it will always return false: because the value is not really an instance of the _DTO_ class, but an instance of Object. That also means that the body argument, altought typed as the _DTO_ class, will not have its methods. Typescript will allow you to call a method as if it were a real _DTO_, but it will throw an exception since that method doesn't really exist. **That's why you should not declare methods on _DTO_ classes**.

  ```typescript
  class SomeDTO {
    public value: string;

    doSomething() {

    }
  }

  @Controller('some-path')
  export class SomeController {
    @Post()
    async create(
      @Body() someDTO: SomeDTO /* <-- Is not a real instance of SomeDTO,
        but is an object literal with the same properties and none of the methods */
    ): Promise<SomeDTO> {
        console.log(someDTO.value) // <-- will print a value

        console.log(someDTO instanceof SomeDTO) /* <-- Will always return false, since someDTO is an instance of an object literal.
        DO NOT USE instanceof TO DISTINGUISH VALUE TYPES */

        someDTO.doSomething() // <-- Will crash, since the object literal has the properties of SomeDTO, but not the methods

        return 'will-never-get-here';
  }
  ```

## Related projects

- Not-Me: <https://github.com/Bartmr/not-me>
