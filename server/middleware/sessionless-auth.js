import passport from 'passport';
import getHeaderUser from '../lib/get-header-user.js';
import payloadExtractor from '../lib/saagie-token.js';
import '../typedefs.js';

/**
 * Middleware to handle passive/sessionless authentication means
 *
 * These kinds of authentications are usually something similar to an API key
 * and do not use the session cookie like other methods.
 * (Google and SAML authenticate with their targets, but still result in a SQLPad user and associated session)
 *
 * @param {Req} req
 * @param {Res} res
 * @param {function} next
 */
function sessionlessAuth(req, res, next) {
  const { config } = req;

  // If the request is already authenticated via something that keeps a session continue
  if (req.isAuthenticated()) {
    return next();
  }

  /**
   * A custom passport authenticate handler to control shape of response
   * Passport otherwise responds with a 401 when not authenticated
   * To keep this response consistent with other APIs, this formats error accordingly
   * @param {*} err
   * @param {*} user
   * @param {*} info
   */
  function handleAuth(err, user, info) {
    const detail = info && info.message;
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.utils.unauthorized(detail);
    }
    // When called without creating a session, no callback is used
    req.logIn(user, { session: false });
    return next();
  }

  // None of the passive auth strategies matched, continue on
  // If middleware further down requires auth a response will be sent appropriately

  // if SAAGIETOKENSAAGIE cookie is present, try to authenticate with it
  if (payloadExtractor(config, req)) {
    return passport.authenticate('saagie', handleAuth)(req, res, next);
  }

  next();
}

export default sessionlessAuth;
