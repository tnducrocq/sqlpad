import fetch from 'node-fetch';
import https from 'https';

const NEXT_URI_TIMEOUT = 100;

export default { send };

// Util - setTimeout as a promise
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Get Trino headers from config
function getHeaders(config) {
  const headers = { };

  if (config.catalog) {
    headers['X-Trino-Catalog'] = config.catalog;
  }

  headers['Authorization'] = "Bearer " + config.jwt;
  headers['Content-Type'] = 'text/plain';
  return headers;
}

// Given config and query, returns promise with the results
function send(config, query) {
  if (!config.url) {
    return Promise.reject(new Error('config.url is required'));
  }

  const results = {
    data: [],
  };

  const agent = new https.Agent({ rejectUnauthorized: false });

  console.log('****trino: send', query);

  const headers = getHeaders(config);
  return fetch(`${config.url}/v1/statement`, {
    method: 'POST',
    body: query,
    headers: headers,
    agent: agent,
  })
  .then((response) => {
    const json = response.json()
    console.log('****trino: receive', json);
    return json;
  })
  .then((statement) => handleStatementAndGetMore(results, statement, config))
  .catch(error => console.error('Error:', error));
}

function updateResults(results, statement) {
  if (statement.data && statement.data.length) {
    results.data = results.data.concat(statement.data);
  }
  if (statement.columns) {
    results.columns = statement.columns;
  }

  console.log('****trino: updateResults', results);
   
  return results;
}

function handleStatementAndGetMore(results, statement, config) {
  if (statement.error) {
    // A lot of other error data available,
    // but error.message contains the detail on syntax issue
    return Promise.reject(new Error(statement.error.message));
  }
  results = updateResults(results, statement);
  if (!statement.nextUri) {
    return Promise.resolve(results);
  }

  const agent = new https.Agent({ rejectUnauthorized: false });

  return wait(NEXT_URI_TIMEOUT)
    .then(() => fetch(statement.nextUri, { agent: agent, headers: getHeaders(config) }))
    .then((response) => {
      const json = response.json()
      console.log('****trino: receive', json);
      return json;
    })
    .then((statement) => handleStatementAndGetMore(results, statement, config));
}
