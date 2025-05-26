/* This code snippet is exporting all the named exports from multiple policy files in a TypeScript
project. It allows other files or modules to import these exports using a single import statement.
This way, the functionality defined in each of these policy files can be accessed from other parts
of the project without having to import each file individually. */
export * from './dreamCompanyPolicy.js';
export * from './dreamOfferPolicy.js';
export * from './maxCompaniesPolicy.js';
export * from './cgpaThresholdPolicy.js';
export * from './placementPercentagePolicy.js';
export * from './offerCategoryPolicy.js';
