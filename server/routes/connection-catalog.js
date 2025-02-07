import '../typedefs.js';
import compression from 'compression';
import mustHaveConnectionAccess from '../middleware/must-have-connection-access.js';
import ConnectionClient from '../lib/connection-client.js';
import wrap from '../lib/wrap.js';
import express from 'express';
const router = express.Router();

/**
 * @param {Req} req
 * @param {Res} res
 */
async function getConnectionCatalog(req, res) {
  const { models, user } = req;
  const { connectionId } = req.params;
  const reload = req.query.reload === 'true';

  const conn = await models.connections.findOneById(connectionId);
  if (!conn) {
    return res.utils.notFound();
  }

  const connectionClient = new ConnectionClient(conn, user);
  const catalogCacheId = connectionClient.getCatalogCacheId(2);

  let catalogInfo = await models.catalogInfo.getCatalogInfo(catalogCacheId);

  if (catalogInfo && !reload) {
    return res.utils.data(catalogInfo);
  }

  try {
    catalogInfo = await connectionClient.getCatalog();
  } catch (error) {
    // Assumption is that error is due to user configuration
    // letting it bubble up results in 500, but it should be 400
    return res.utils.error(error);
  }

  if (Object.keys(catalogInfo).length) {
    await models.catalogInfo.saveCatalogInfo(catalogCacheId, catalogInfo);
  }
  return res.utils.data(catalogInfo);
}

// compression is added here becasue a big database server can have huge amount
// of metadata and since this is not retrieved catalog by catalog 20mb+ would easily be possible in plain/text
// on slow connections where a LB does not compress this can be a big bottleneck.
router.get(
  '/api/connections/:connectionId/catalog',
  compression(),
  mustHaveConnectionAccess,
  wrap(getConnectionCatalog)
);

export default router;
