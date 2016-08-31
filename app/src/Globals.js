// Set globals from env variables
const globals = {
  k8s : {
    url: process.env.K8S_URL,
    token: process.env.K8S_TOKEN,
    userspace: process.env.K8S_USERSPACE
  }
};

export default globals;
