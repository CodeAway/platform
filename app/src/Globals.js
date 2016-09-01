let _globals;
if (global.__SERVER__) {
  _globals = {
    projectDomain: process.env.BASE_DOMAIN,
    scheme: process.env.SCHEME,
    repoName: 'imad-2016-app'
  };
} else {
  _globals = {
    projectDomain: window.__env.baseDomain,
    scheme: window.__env.scheme,
    repoName: 'imad-2016-app'
  };
}
const globals = _globals;
export default globals;
