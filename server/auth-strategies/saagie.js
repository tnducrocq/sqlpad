import passport from 'passport';
import { Strategy as PassportCustomStrategy } from 'passport-custom';
//import axios from 'axios';
import appLog from '../lib/app-log.js';
import payloadExtractor from '../lib/saagie-token.js';

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

            const payload = payloadExtractor(config, req);
            if (!payload) {
                appLog.info('no saagie token.');
                return done(null, false, { message: 'no saagie token' });
            }
        
            try {
                /*const response = await axios.get('http://localhost:8050/api/rights', {
                    headers: { Authorization: `Bearer ${token}` },
                });
        
                const userRights = response.data;
        
                if (!userRights || !userRights.valid) {
                    return done(null, false);
                }*/

                var user = await models.users.findOneByEmail(payload.email);
                if (!user) {
                    user = await models.users.create(payload); 
                } else {
                    user = await models.users.update(user.id, payload);
                }
                
                appLog.info('done saagie token.');
                return done(null, payload);
            } catch (error) {
                appLog.error('Erreur API Auth:', error.message); 
                return done(null, false, { message: 'no valid saagie token' });
            }
        })
    );
}

export default enableSaagieServiceToken;