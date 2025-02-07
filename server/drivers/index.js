import appLog from '../lib/app-log.js';
import validate from './validate.js';
import trino from './trino/index.js';

const drivers = {
  trino,
};

export const initDrivers = async () => {
  // unixodbc is an optional dependency due to it needing to be compiled
  // (and lacks prebuilt binaries like sqlite provides)
  try {
    appLog.info('Loading odbc');
    drivers.unixodbc = await import('./unixodbc/index.cjs').then(
      (module) => module.default
    );
    appLog.info('Loaded odbc');
  } catch (error) {
    appLog.info('ODBC driver not available');
  }
};

// Validate each driver implementation to ensure it matches expectations
Object.keys(drivers).forEach((id) => {
  const driver = drivers[id];
  validate(id, driver);
});

export default drivers;
