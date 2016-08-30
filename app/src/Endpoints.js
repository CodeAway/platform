import globals from './Globals';

const scheme = globals.scheme + ':';
const domain = globals.projectDomain;

const Endpoints = {
  authUrl: scheme + '//auth.' + domain,
  dataUrl: scheme + '//data.' + domain,
  apiUrl: scheme + '//api.' + domain,
};
const globalCookiePolicy = 'include';

export default Endpoints;
export {globalCookiePolicy, domain, scheme};
