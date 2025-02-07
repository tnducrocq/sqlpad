import trino from './_trino.js';
import { formatSchemaQueryResults } from '../utils.js';

const id = 'trino';
const name = 'Trino';
const asynchronous = true;
const hasCatalog = true;

function getTrinoSchemaSql(catalog, schema) {
  const schemaSql = schema ? `AND table_schema = '${schema}'` : '';
  return `
    SELECT 
      c.table_schema, 
      c.table_name, 
      c.column_name, 
      c.data_type
    FROM 
      INFORMATION_SCHEMA.COLUMNS c
    WHERE
      table_catalog = '${catalog}'
      ${schemaSql}
    ORDER BY 
      c.table_schema, 
      c.table_name, 
      c.ordinal_position
  `;
}

/**
 * Run query for connection
 * Should return { rows, incomplete }
 * @param {string} executionId
 * @param {object} connection
 * @param {object} user
 */
function runQuery(executionId, connection, user) {
  let incomplete = false;
  const rows = [];
  const port = connection.port || 8080;
  const protocol = connection.useHTTPS ? 'https' : 'http';
  const config = {
    url: `${protocol}://${connection.host}:${port}`,
    user: user.email,
    catalog: connection.catalog,
    jwt: user.token,
  };

  return trino.followExecutionQuery(config, executionId).then((result) => {
    if (!result) {
      throw new Error('No result returned');
    }
    let { data, columns } = result;
    if (data.length > connection.maxRows) {
      incomplete = true;
      data = data.slice(0, connection.maxRows);
    }
    for (let r = 0; r < data.length; r++) {
      const row = {};
      for (let c = 0; c < columns.length; c++) {
        row[columns[c].name] = data[r][c];
      }
      rows.push(row);
    }
    return { rows, incomplete };
  });
}

function startQuery(query, connection, user) {
  let incomplete = false;
  const rows = [];
  const port = connection.port || 8080;
  const protocol = connection.useHTTPS ? 'https' : 'http';
  const config = {
    url: `${protocol}://${connection.host}:${port}`,
    user: user.email,
    catalog: connection.catalog,
    jwt: user.token,
  };

  return trino.send(config, query).then((result) => {
    if (!result) {
      throw new Error('No result returned');
    }
    let { data, columns } = result;
    if (data.length > connection.maxRows) {
      incomplete = true;
      data = data.slice(0, connection.maxRows);
    }
    for (let r = 0; r < data.length; r++) {
      const row = {};
      for (let c = 0; c < columns.length; c++) {
        row[columns[c].name] = data[r][c];
      }
      rows.push(row);
    }
    return { rows, incomplete };
  });
}

/**
 * Run query for connection and return execution ID to enable query cancellation
 * Should return execution ID
 * @param {string} query
 * @param {object} connection
 * @param {object} user
 */
function startQueryExecution(query, connection, user) {
  const port = connection.port || 8080;
  const protocol = connection.useHTTPS ? 'https' : 'http';
  const config = {
    url: `${protocol}://${connection.host}:${port}`,
    user: user.email,
    catalog: connection.catalog,
    jwt: user.token,
  };

  return trino.startExecutionQuery(config, query).then((executionId) => {
    if (!executionId) {
      throw new Error('No executionId returned');
    }
    return executionId;
  }); 
}

/**
 * Cancel query for connection
 * Should return { rows, incomplete }
 * @param {string} executionId
 * @param {object} connection
 * @param {object} user
 */
function cancelQuery(executionId, connection, user) {
  const port = connection.port || 8080;
  const protocol = connection.useHTTPS ? 'https' : 'http';
  const config = {
    url: `${protocol}://${connection.host}:${port}`,
    user: user.email,
    catalog: connection.catalog,
    jwt: user.token,
  };

  return trino.cancelExecutionQuery(config, executionId)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to cancel query: ${response.statusText}`);
      }
      return true;
    }).catch(error => {
      console.error("trino-cancel-error", error.message);
      return false; 
    });
}

/**
 * Test connectivity of connection
 * @param {*} connection
 */
function testConnection(connection, user) {
  const query = "SELECT 'success' AS TestQuery";
  return startQuery(query, connection, user);
}

/**
 * Get schema for connection
 * @param {*} connection
 */
function getSchema(connection, user) {
  const schemaSql = getTrinoSchemaSql(connection.catalog, connection.schema);
  return startQuery(schemaSql, connection, user).then((queryResult) =>
    formatSchemaQueryResults(queryResult)
  );
}

/**
 * Get catalog for connection
 * @param {*} connection
 */
function getCatalog(connection, user) {
  const catalogSql = 'SHOW CATALOGS';
  return startQuery(catalogSql, connection, user).then((queryResult) =>
    queryResult.rows.map(row => row.Catalog)
  );
}

const fields = [
  {
    key: 'host',
    formType: 'TEXT',
    label: 'Host/Server/IP Address',
  },
  {
    key: 'port',
    formType: 'TEXT',
    label: 'Port (optional)',
  },
  {
    key: 'catalog',
    formType: 'TEXT',
    label: 'Catalog',
  },
  {
    key: 'useHTTPS',
    formType: 'CHECKBOX',
    label: 'Use HTTPS',
  },
];

export default {
  id,
  name,
  fields,
  asynchronous,
  hasCatalog,
  getCatalog,
  getSchema,
  runQuery,
  startQueryExecution,
  cancelQuery,
  testConnection,
};
