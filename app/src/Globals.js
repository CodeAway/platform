let _globals;
if (global.__SERVER__) {
  _globals = {
    projectDomain: process.env.BASE_DOMAIN,
    githubClientID: process.env.GITHUB_CLIENT_ID,
    scheme: process.env.SCHEME,
    repoName: process.env.REPO_NAME
  };
} else {
  _globals = {
    projectDomain: window.__env.baseDomain,
    githubClientID: window.__env.githubClientID,
    scheme: window.__env.scheme,
    repoName: window.__env.repoName
  };
}
const globals = _globals;
export default globals;
