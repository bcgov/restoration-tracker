# bcgov/restoration-tracker/database

## Technologies Used

| Technology | Version | Website                              | Description          |
| ---------- | ------- | ------------------------------------ | -------------------- |
| node       | 14.x.x  | https://nodejs.org/en/               | JavaScript Runtime   |
| npm        | 6.x.x   | https://www.npmjs.com/               | Node Package Manager |
| PostgreSQL | 12.5    | https://www.postgresql.org/download/ | PSQL database        |
| PostGIS    | 3       | https://postgis.net/                 | GIS (spatial) tools  |

<br />

## Knex Migrations / Seeds

### Migrations

An ordered list of database changes (creates, deletes, alters, etc). The latest version of your database will then be the summation of all of the migration changes, applied in order.

Useful resource https://devhints.io/knex

To run migrations locally using your terminal, export the required environment variables. For example if an env variable is DB_SCHEMA=restoration

```
EXPORT DB_SCHEMA=restoration
```

To test that it worked:

```
ECHO $DB_SCHEMA
```

### Seeds

A set of scripts that populate the database tables with any ephemeral values required for the app to function during development. This can include dummy data so that when the app is running locally, you don't have to manually create a bunch of data in order to experience the app as it would be in a real environment.

Seeds will run in alphanumeric order, so if the order of seeds is important, consider prefixing the file name with a number.

# Port forward to remote database

1. Open a terminal
2. Log in to OpenShift using the login command copied from the web-console
3. Get onto the correct project
   ```
   oc projects
   oc project <correct project name>
   ```
4. Find the database pod
   ```
   oc get pods
   ```
5. Port forward

   ```
   oc port-forward <pod name> <local port to use>:<remove port to forward>

   Ex:

   oc port-forward restoration-tracker-db-postgresql-dev-deploy-100 5555:5432
   ```

<br />

# General PSQL commands

## Dumping the database

Doc: https://www.postgresql.org/docs/9.6/app-pgdump.html

```
pg_dump databaseName > dumpFileName
```

### Useful options:

    --schema-only
    --data-only

## Restoring the database from a dump

Doc: https://www.postgresql.org/docs/9.6/app-pgrestore.html

```
pg_restore dumpFileName
```

### Useful options:

    --schema-only
    --data-only

<br />

# Troubleshooting

## Knex

`Error: knex: Required configuration option 'client' is missing.`

- Double check that your environment variables have been set correctly, specifically `NODE_ENV`. To do this you can run the following command from the `database/src` directory:

  ```
  export NODE_ENV = local
  ```

- Double check that the line endings of the `.env` file are `LF` and not `CLRF`

## Git Actions

`Error: Timeout waiting for ImageStreamTag/restoration-tracker-db:build-1.0.0-123 to become available`

- Git Action to build the database image fails.

- Double check that the imagestreamtag listed in the `db.bc.yaml` exists in the OpenShift tools environment.

  - If it does not exist, or the image stream exists but has no matching tag, run the following command using the OC CLI.

    ```
    oc import-image crunchy-postgres-gis:ubi8-14.2-3.1-0 --from=registry.connect.redhat.com/crunchydata/crunchy-postgres-gis:ubi8-14.2-3.1-0 --confirm
    ```

  - Note: At the time of writing this, the image is `crunchy-postgres-gis:ubi8-14.2-3.1-0`, update the above command as needed if the image or version has since changed.
