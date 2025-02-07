import jwt from 'jsonwebtoken';

export function getSaagieCookie(config, req) {
    const cookieHeader = req.headers["cookie"];
    if(!cookieHeader) {
        return null;
    }
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
        const [name, value] = cookie.trim().split('=');
        acc[name] = value;
        return acc;
    }, {});
    if(!cookies) {
        return null;
    }

    const installationId = "saagie"; // a prendre dans config
    const saagieToken = cookies[`SAAGIETOKEN${installationId.toUpperCase()}`];
    return saagieToken;
}

export function payloadExtractor(config, saagieToken) {
    const payload = jwt.decode(saagieToken)
    if(!payload) {
        return null;
    }

    /*const response = await axios.get('http://localhost:8050/api/rights', {
        headers: { Authorization: `Bearer ${token}` },
    });

    const userRights = response.data;

    if (!userRights || !userRights.valid) {
        return done(null, false);
    }*/


    return payload
}

