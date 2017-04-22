import globals from './Globals';

const scheme = (globals.scheme && globals.scheme.trim() !== '') ? (globals.scheme + ':') : '';
const domain = globals.projectDomain;

const Endpoints = {
  authUrl: scheme + '//auth.' + domain,
  dataUrl: scheme + '//data.' + domain,
  apiUrl: scheme + '//api.' + domain,
  ghRedirect: scheme + '//api.' + domain + '/github/authenticate'
};
const globalCookiePolicy = 'include';

export default Endpoints;
export {globalCookiePolicy, domain, scheme};
