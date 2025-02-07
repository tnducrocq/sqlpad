import fetch from 'node-fetch';
import https from 'https';
import { resolve } from 'path';
const NEXT_URI_TIMEOUT = 100;

export default { send, startExecutionQuery, followExecutionQuery, cancelExecutionQuery };

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
  if (!query) {
    return Promise.reject(new Error('query is required'));
  }

  const results = {
    data: [],
  };
  const agent = new https.Agent({ rejectUnauthorized: false });
  return fetch(`${config.url}/v1/statement`, {
    method: 'POST',
    body: query,
    headers: getHeaders(config),
    agent: agent,
  })
    .then((response) => response.json())
    .then((statement) => handleStatementAndGetMore(results, statement, config));
}

// Given config and executionId, returns promise with the results
function followExecutionQuery(config, executionId) {
  if (!config.url) {
    return Promise.reject(new Error('config.url is required'));
  }
  if (!executionId) {
    return Promise.reject(new Error('executionId is required'));
  }

  const results = {
    data: [],
  };
  const agent = new https.Agent({ rejectUnauthorized: false });
  const headers = getHeaders(config);
  return fetch(`${config.url}/v1/statement/queued/${executionId}`, {
    method: 'GET',
    headers: headers,
    agent: agent,
  })
  .then((response) => response.json())
  .then((statement) => handleStatementAndGetMore(results, statement, config))
  .catch(error => console.error('Error:', error));
}

// Given config and query, returns promise with the results
function startExecutionQuery(config, query) {
  if (!config.url) {
    return Promise.reject(new Error('config.url is required'));
  }
  if (!query) {
    return Promise.reject(new Error('query is required'));
  }

  const agent = new https.Agent({ rejectUnauthorized: false });
  const headers = getHeaders(config);
  return fetch(`${config.url}/v1/statement`, {
    method: 'POST',
    body: query,
    headers: headers,
    agent: agent,
  })
  .then((response) => response.json())
  .then((statement) => {
    const regex = /https?:\/\/[^\/]+\/v1\/statement\/queued\/(.+)/;
    const match = statement.nextUri.match(regex);
    if (!match) {
      throw new Error(`Failed to find executionId in nextUri: ${statement.nextUri}`);
    }
    return match[1];
  })
  .catch(error => console.error('Error:', error));
}

function updateResults(results, statement) {
  if (statement.data && statement.data.length) {
    results.data = results.data.concat(statement.data);
  }
  if (statement.columns) {
    results.columns = statement.columns;
  }
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
    .then((response) => response.json())
    .then((statement) => handleStatementAndGetMore(results, statement, config));
}

function cancelExecutionQuery(config, executionId) {
  if (!executionId) {
    return Promise.reject(new Error('executionId is required'));
  }
  if (!config.url) {
    return Promise.reject(new Error('config.url is required'));
  }

  const cancelId = executionId.split("/")[0];
  const agent = new https.Agent({ rejectUnauthorized: false });

  const headers = getHeaders(config);
  return fetch(`${config.url}/v1/query/${cancelId}`, {
    method: 'DELETE',
    headers: headers,
    agent: agent,
  })
  .catch(error => console.error('Error:', error));
}