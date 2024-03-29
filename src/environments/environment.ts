// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  apiAddress: 'https://dev.api.portal.tsi.ebi.ac.uk/',
  authAddress: 'https://api.aai.ebi.ac.uk/',
  bioToolsAPI: 'https://dev.tsi.ebi.ac.uk/workbench/biotools.json',
  binderHubAPI: 'https://hub-binder-staging.tsi.ebi.ac.uk/hub/'
};
