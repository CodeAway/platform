// Set globals from env variables
const globals = {
  k8s: {
    url: process.env.K8S_URL,
    token: process.env.K8S_TOKEN,
    auth: process.env.K8S_AUTH,
    userspace: process.env.K8S_USERSPACE
  },
  imad: {
    simpleNodeAppImage: process.env.SIMPLE_NODE_WEB_APP || 'hasura/simple-node-web-app:latest',
    namespace: process.env.NAMESPACE || 'default'
  }
};

export default globals;
