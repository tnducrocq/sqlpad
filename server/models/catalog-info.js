import ensureJson from './ensure-json.js';

class CatalogInfo {
  /**
   * @param {import('../sequelize-db/index.js')}
   * @param {import('../lib/config/index.js')} config
   */
  constructor(sequelizeDb, config) {
    this.sequelizeDb = sequelizeDb;
    this.config = config;
  }

  /**
   * Get catalogInfo for catalog id
   * @param {string} catalogCacheId
   */
  async getCatalogInfo(catalogCacheId) {
    const doc = await this.sequelizeDb.Cache.findOne({
      where: { id: catalogCacheId },
    });

    if (!doc) {
      return;
    }

    return ensureJson(doc.data);
  }

  /**
   * Save catalogInfo to cache db object
   * @param {string} catalogCacheId
   * @param {object} catalog
   */
  async saveCatalogInfo(catalogCacheId, catalog) {
    const id = catalogCacheId;
    const existing = await this.sequelizeDb.Cache.findOne({ where: { id } });
    const ONE_DAY = 1000 * 60 * 60 * 24;
    const expiryDate = new Date(Date.now() + ONE_DAY);

    if (!existing) {
      return this.sequelizeDb.Cache.create({
        id,
        data: catalog,
        expiryDate,
        name: 'catalog cache',
      });
    } else {
      return this.sequelizeDb.Cache.update(
        { data: catalog, expiryDate, name: 'catalog cache' },
        { where: { id } }
      );
    }
  }
}

export default CatalogInfo;
