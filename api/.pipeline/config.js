'use strict';
let options = require('pipeline-cli').Util.parseArguments();

// The root config for common values
const config = require('../../.config/config.json');

const defaultHost = 'restoration-tracker-b1d40d-api.apps.silver.devops.gov.bc.ca';

const name = (config.module && config.module['api']) || 'restoration-tracker-api';
const dbName = (config.module && config.module['db']) || 'restoration-tracker-db';

const changeId = options.pr || `${Math.floor(Date.now() * 1000) / 60.0}`; // aka pull-request or branch
const version = config.version || '1.0.0';

// A static deployment is when the deployment is updating dev, test, or prod (rather than a temporary PR)
const isStaticDeployment = options.type === 'static';

const deployChangeId = (isStaticDeployment && 'deploy') || changeId;
const branch = (isStaticDeployment && options.branch) || null;
const tag = (branch && `build-${version}-${changeId}-${branch}`) || `build-${version}-${changeId}`;

const staticBranches = config.staticBranches || [];
const staticUrlsAPI = config.staticUrlsAPI || {};

const processOptions = (options) => {
  const result = { ...options };

  // Check git
  if (!result.git.url.includes('.git')) {
    result.git.url = `${result.git.url}.git`;
  }

  if (!result.git.http_url.includes('.git')) {
    result.git.http_url = `${result.git.http_url}.git`;
  }

  // Fixing repo
  if (result.git.repository.includes('/')) {
    const last = result.git.repository.split('/').pop();
    const final = last.split('.')[0];
    result.git.repository = final;
  }

  return result;
};

options = processOptions(options);

const phases = {
  build: {
    namespace: 'b1d40d-tools',
    name: `${name}`,
    dbName: `${dbName}`,
    phase: 'build',
    changeId: changeId,
    suffix: `-build-${changeId}`,
    instance: `${name}-build-${changeId}`,
    version: `${version}-${changeId}`,
    tag: tag,
    env: 'build',
    elasticsearchURL: 'https://elasticsearch-b1d40d-dev.apps.silver.devops.gov.bc.ca',
    tz: config.timezone.api,
    branch: branch,
    logLevel: isStaticDeployment && 'info' || 'debug'
  },
  dev: {
    namespace: 'b1d40d-dev',
    name: `${name}`,
    dbName: `${dbName}`,
    phase: 'dev',
    changeId: deployChangeId,
    suffix: `-dev-${deployChangeId}`,
    instance: `${name}-dev-${deployChangeId}`,
    version: `${deployChangeId}-${changeId}`,
    tag: `dev-${version}-${deployChangeId}`,
    host:
      (isStaticDeployment && (staticUrlsAPI.dev || defaultHost)) ||
      `${name}-${changeId}-b1d40d-dev.apps.silver.devops.gov.bc.ca`,
    env: 'dev',
    elasticsearchURL: 'https://elasticsearch-b1d40d-dev.apps.silver.devops.gov.bc.ca',
    tz: config.timezone.api,
    sso: config.sso.dev,
    replicas: 1,
    maxReplicas: 2,
    logLevel: isStaticDeployment && 'info' || 'debug'
  },
  test: {
    namespace: 'b1d40d-test',
    name: `${name}`,
    dbName: `${dbName}`,
    phase: 'test',
    changeId: deployChangeId,
    suffix: `-test`,
    instance: `${name}-test`,
    version: `${version}`,
    tag: `test-${version}`,
    host: staticUrlsAPI.test,
    env: 'test',
    elasticsearchURL: 'https://elasticsearch-b1d40d-dev.apps.silver.devops.gov.bc.ca',
    tz: config.timezone.api,
    sso: config.sso.test,
    replicas: 1,
    maxReplicas: 2,
    logLevel: 'info'
  },
  prod: {
    namespace: 'b1d40d-prod',
    name: `${name}`,
    dbName: `${dbName}`,
    phase: 'prod',
    changeId: deployChangeId,
    suffix: `-prod`,
    instance: `${name}-prod`,
    version: `${version}`,
    tag: `prod-${version}`,
    host: staticUrlsAPI.prod,
    env: 'prod',
    elasticsearchURL: 'http://es01.a0ec71-prod:9200',
    tz: config.timezone.api,
    sso: config.sso.prod,
    replicas: 1,
    maxReplicas: 2,
    logLevel: 'info'
  }
};

// This callback forces the node process to exit as failure.
process.on('unhandledRejection', (reason) => {
  console.log(reason);
  process.exit(1);
});

module.exports = exports = { phases, options, staticBranches };
