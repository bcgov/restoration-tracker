// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on, config) => {
  // // `on` is used to hook into various events Cypress emits
  // // `config` is the resolved Cypress config

  // // modify config values
  // config.defaultCommandTimeout = 10000;

  // // TODO: add logic to use the urls based on the current environment
  // // https://dev-restoration-tracker.apps.silver.devops.gov.bc.ca
  // config.baseUrl = process.env.host || "https://dev-restoration-tracker.apps.silver.devops.gov.bc.ca";
  // config.env.ENVIRONMENT = 'dev';

  // // return config
  // return config;
};
