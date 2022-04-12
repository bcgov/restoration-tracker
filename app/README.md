# bcgov/restoration-tracker/app

## Technologies Used

| Technology | Version | Website                | Description          |
| ---------- | ------- | ---------------------- | -------------------- |
| node       | 14.x.x  | https://nodejs.org/en/ | JavaScript Runtime   |
| npm        | 6.x.x   | https://www.npmjs.com/ | Node Package Manager |

<br />

# Linting and Formatting

## Info

Linting and formatting is handled by a combiation of `ESlint` and `Prettier`. The reason for this, is that you get the best of both worlds: ESlint's larger selection of linting rules with Prettier's robust formatting rules. EditorConfig is additionally used to add enforce some basic IDE formatting rules.

### Technologies used

- [ESlint](https://eslint.org/)
- [Prettier](https://prettier.io/)
- [EditorConfig](http://editorconfig.org)

### Configuration files

- ESlint
  - .eslintrc
  - .eslintignore
- Prettier
  - .prettierrc
  - .prettierignore
- EditorConfig
  - .editorconfig

## Run Linters

- Lint the `*.ts` files using `ESLint`.

```
npm run lint
```

## Run Linters + Formatters

_Note: In the worst case scenario, where linting/formatting has been neglected, then these `lint:fix` commands have the potential to create 100's of file changes. In this case, it is recommended to only run these commands as part of a separate commit._

_Note: Not all linting/formatting errors can be automatically fixed, and will require human intervention._

- Lint and fix the `*.ts` files using `ESLint` + `Prettier`.

```
npm run lint:fix
```

<br />

# Testing

## Technologies used

- [Jest](https://jestjs.io/docs/en/getting-started) - test framework
- [React Testing Library](https://testing-library.com) - test utilities

## Running Tests

- Run the unit tests

  ```
  npm run test
  ```

- Run the unit tests in watch mode (will re-run the tests on code changes).

  ```
  npm run test:watch
  ```

- Run the unit test coverage report

  ```
  npm run coverage
  ```

- Generate new snapshots

  See [Snapshot Tests](#snapshot-tests) for details

  ```
  npm run update-snapshots <file_name_with_outdated_snapshots>
  ```

## Writing Tests

Any files that match `/src/**/*.@(test|spec).ts` will be considered tests.

### Unit Tests

Tests that assert a function, given some input, returns an expected output.

_Note: These only apply if the function in question has NO react concepts (it is a pure function). If a function contains react conceps (state, hooks, etc) it will need to be tested in a [Dom Tests](#dom-tests) style, which has mechanisms to account for the rendering lifecycle, etc._

#### Useful Documentation

- https://jestjs.io/docs/en/getting-started

### React Tests

Tests that simulate the user experience, and make assertions about the state of the page and related variables.

#### Useful Documentation

- https://testing-library.com/docs/

#### Relevant Sample Projects

- https://github.com/bcgov/PIMS
  - SplReportContainer.test.tsx
  - useRouterFilter.test.tsx
  - LayersControl.test.tsx
  - etc...

### Snapshot Tests

_Note: Snapshot tests are being phased out of this project, and should no longer be created._

Snapshot tests are a special kind of jest test that asserts that a previously saved copy of the rendered component matches the current version of the rendered component. These tests assert that the rendered UI of the component is correct, under whatever pre-conditions are set up in the test.

The problem with snapshot tests is that they rely on a human to compare the snapshot with the component and manually determine if the snapshot contains the correct data. Without this, anyone can re-generated a snapshot and it will just always match the component regardless of its correctness. Traditional tests that assert specific aspects of the component should be used instead.

<br />

# Nice To Know

## Environment Variables

- With the exception of `NODE_ENV`, any environment variable that needs to be accessible by the react app (via `process.env.<var>`) must be prefixed with `REACT_APP_`. If it is not prefixed, react will not read it, and it will be `undefined` when you try to access it.

  - Example: `REACT_APP_MY_VAR=myvar`
  - See: https://create-react-app.dev/docs/adding-custom-environment-variables

  - Caveat: React only allows/supports `NODE_ENV:'development'|'test'|'production'`
    - `react-scripts start` -> `NODE_ENV=development`
    - `react-scripts test` -> `NODE_ENV=test`
    - `react-scripts build` -> `NODE_ENV=production`

## .env

- React will read a `.env` or similar file by default, and will read any variables prefixed with `REACT_APP_`.
  - See: https://create-react-app.dev/docs/adding-custom-environment-variables/#what-other-env-files-can-be-used

# Troubleshooting and Known Issues

### `typescript` version

There is a known issue between typescript `4.x` and `eslint` that can result in the following error when running the linter, via: `npm run lint`

The simplest solution for now is to keep typescript at the latest `3.x` version.

- There is some discussion here (among other places):  
  https://stackoverflow.com/questions/62079477/line-0-parsing-error-cannot-read-property-map-of-undefined/63660413

```
0:0 error Parsing error: Cannot read property 'map' of undefined
```
