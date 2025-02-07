import passport from 'passport';
import { Strategy as PassportCustomStrategy } from 'passport-custom';
//import axios from 'axios';
import appLog from '../lib/app-log.js';
import { getSaagieCookie, payloadExtractor } from '../lib/saagie-token.js';

/**
 * Adds Saagie JWT Service Token auth strategy if configured
 *
 * Saagie JWT auth is a fallback authentication method for service tokens when no
 * authenticated session in passport created by other strategies like Local
 * Auth, OAuth or SAML
 * @param {object} config
 */
function enableSaagieServiceToken(config) {
    appLog.info('Enabling Saagie JWT Service Token authentication strategy.');
    
    passport.use('saagie', new PassportCustomStrategy(async (req, done) => {
            const { models } = req;

            const saagieToken = getSaagieCookie(config, req);
            const payload = payloadExtractor(config, saagieToken);
            if (!payload) {
                appLog.info('no saagie token.');
                return done(null, false, { message: 'no saagie token' });
            }

            const user = {
                id: payload["sub"],
                email: payload["preferred_username"],
                role: "viewer", // TODO put viewer for disable editing connections or admin for all rights
                token: saagieToken,
            } 
        
            try {
                if (!await models.users.findOneByEmail(user.email)) {
                    await models.users.create(user); 
                } else {
                    await models.users.update(user.id, user);
                }
                
                appLog.info('done saagie token.');
                return done(null, user);
            } catch (error) {
                appLog.error('Erreur API Auth:', error.message); 
                return done(null, false, { message: 'no valid saagie token' });
            }
        })
    );
}

export default enableSaagieServiceToken;