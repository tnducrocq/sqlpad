import Sequelize from 'sequelize';
import migrationUtils from '../lib/migration-utils.js';

/**
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {import('../lib/config')} config
 * @param {import('../lib/logger')} appLog
 * @param {object} sequelizeDb - sequelize instance
 */
// eslint-disable-next-line no-unused-vars
export async function up(queryInterface, config, appLog, sequelizeDb) {
  try {
    // remove unique not-null constraint for email
    await queryInterface.changeColumn('users', 'email', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: false,
    });
  } catch (error) {
    // ignore error. constraint may not exist depending on backend database
  }

  await migrationUtils.addOrReplaceIndex(
    queryInterface,
    'users',
    'users_email',
    ['email'],
    {
      unique: true,
      where: {
        email: {
          [Sequelize.Op.ne]: null,
        },
      },
    }
  );

  await queryInterface.addColumn('users', 'token', {
    type: Sequelize.STRING,
  });

  await migrationUtils.addOrReplaceIndex(
    queryInterface,
    'users',
    'users_token',
    ['token'],
    {
      unique: true,
      where: {
        token: {
          [Sequelize.Op.ne]: null,
        },
      },
    }
  );
}

export default {
  up,
};
