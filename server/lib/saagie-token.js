import jwt from 'jsonwebtoken';

export default function payloadExtractor(config, req) {
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
    const saagieToken = cookies["SAAGIETOKENSAAGIE"];
    if(!saagieToken) {
        return null;
    }

    const payload = jwt.decode(saagieToken)
    if(!payload) {
        return null;
    }
    const user = {
        id: payload["sub"],
        email: payload["preferred_username"],
        role: "viewer", // TODO put viewer for disable editing connections or admin for all rights
        token: saagieToken,
    }

    // TODO le jwt n'est pas testé par SQLPad, mais il l'est pas trino, doit on le tester ici ?
    return user
}

