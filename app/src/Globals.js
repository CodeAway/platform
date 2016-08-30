let _globals;
if (global.__SERVER__) {
  _globals = {
    projectDomain: process.env.BASE_DOMAIN,
    scheme: process.env.SCHEME
  };
} else {
  _globals = {
    projectDomain: window.__env.baseDomain,
    scheme: window.__env.scheme
  };
}
const globals = _globals;
export default globals;
