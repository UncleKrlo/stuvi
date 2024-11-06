/**
   Implements .env file loading that mimicks the way create-react-app
   does it. We want this to get consistent configuration handling
   between client and node server.
*/

const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

const NODE_ENV = process.env.NODE_ENV;

if (!NODE_ENV) {
  throw new Error('The NODE_ENV environment variable is required but was not specified.');
}

// https://github.com/bkeepers/dotenv#what-other-env-files-can-i-use
var dotenvFiles = [
  `.env.${NODE_ENV}.local`,
  NODE_ENV !== 'test' && `.env.local`,
  `.env.${NODE_ENV}`,
  '.env',
  '.env.server'
].filter(Boolean);

const configureEnv = () => {
  dotenvFiles.forEach(dotenvFile => {
    if (fs.existsSync(dotenvFile)) {
      console.log('Loading env from file:', dotenvFile);
      require('dotenv-expand')(
        dotenv.config({
          path: dotenvFile,
        })
      );
    }
  });
};

module.exports = {
  configureEnv: configureEnv,
};
