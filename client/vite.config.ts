import react from '@vitejs/plugin-react';

const sourcemap = process.env.SOURCEMAP === 'true';

// For each route prefix below, add proxy entry to http://localhost:3010
// Add another set with '/sqlpad' prefix, as that base url is used during dev/testing
// Previously this project use create-react-app, which automatically fell back to proxy for special cases
// With Vite, this needs to be more explicit
const PROXY_ROUTES = [
  '/api',
  '/statement-results',
  '/auth/saml',
  '/login/callback',
  '/auth/google',
  '/auth/oidc',
];

const PROXY_URL =
  process.env.TELEPRESENCE === 'true'
    ? 'http://saagie-common-sqlpad-api.saagie.svc.cluster.local:3000'
    : 'http://127.0.0.1:3010';

const proxy: Record<string, string> = {};

PROXY_ROUTES.forEach((route) => {
  proxy[route] = PROXY_URL;
  proxy[`/sqlpad${route}`] = PROXY_URL;
});

// This wildcard route is used for the UI to figure out what the baseURL is for the app
// The UI is built without knowing this information
proxy['^/.*/api/app'] = PROXY_URL;

// https://vitejs.dev/config/
const getConfig = ({ command, mode }) => {
  return {
    base: '/sqlpad',
    plugins: [react()],
    server: {
      port: 3000,
      proxy,
      allowedHosts: true,
    },
    build: {
      outDir: 'build',
      sourcemap,
    },
  };
};

export default getConfig;
