# User Settings service

This is User Settings gRPC service. Used to store client-side user settings using key-value storage by appName and username.

## Configuration

Configuration is stored in `./config/default.toml`.
Default configuration can be overridden with `./config/development.toml` file.

You can also override defaults using ENV variables, as described in `./config/custom-environment-variables.json`

## RPCs desc in proto file [here](https://gitlab.advsys.work/platform/schemas/-/blob/feat/FRT-2228_user_settings_service/services/user_settings/v1/user_settings_api.proto)

### RPCs list

- `subscribeToUserSettings`
- `upsertUserSettings`
- `removeUserSettings`

If proto [MR](https://gitlab.advsys.work/platform/schemas/-/merge_requests/31) has been already merged then check it on the master branch

## How to connect to the Postgresql server locally

1. Start up your local Postgresql DB server. In the future the Docker image will be available from our Nexus docker registry.
2. Create .env file in the folder packages/backend/user-settings
3. In the .env file add connection string to your local database
```DATABASE_URL="postgresql://[username]:[password]@[hostname|localhost]:[port|5432]/user_settings?schema=public"```

## How to run the app?

```shell
# Run in the repository root
npm i

# On folder packages/backend/user-settings run
npm run dev
```

## How to build?

```shell
# Run in the repository root
npm i

# On folder packages/backend/user-settings run
npm run build
```

Build artifacts you can find in the /dist/@backend/user-settings folder

## How to use stub client?

You can use `npm run client` script to launch stub client located here packages/backend/user-settings/test/client/stub-client.ts

## How to generate Prisma types?

If you find out that you have some typescript errors related to the Prisma, then that might mean that you need to generate typescript interfaces for Prisma schema.

```shell
# To generate those interface run in the packages/backend/user-settings
npm run prisma:generate
```

Above command will generate typescript interfaces according to the Prisma schema located here packages/backend/user-settings/prisma/schema.prisma
This will inforce you to use ORM which will rely on the models you created in the Prisma schema.
So don't forget to update typescript interfaces once you change the model in the Prisma schema. Also, you need to create sql migration and apply them on your database.

Btw, when you do root `npm install`, the `npm run prisma:generate` gets run on `postinstall`, so you don't have to care about it most of the time.

## How to create Prisma migration?

```shell
npx prisma migrate dev --name your_migration_desc
```

This will create migration in the packages/backend/user-settings/prisma/migrations folder and also apply them on your local Postgresql db.

## How to generate Prisma down migration?

According to the our company policy we store all databases' migrations in the separate repository [here](https://gitlab.advsys.work/platform/database-migrations/-/tree/master/postgresql/user-settings?ref_type=heads)

We have to put there new migrations and additionally supply down migrations.

To create down migration after Prisma schema change and before creating up migrations, run the following command on packages/backend/user-settings

```shell
npm run prisma:create-down-migration
```

This will create down migration here packages/backend/user-settings/prisma/migrations/down.sql
So please place it near the corresponding up migration folder.
