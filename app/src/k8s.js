import fetch from 'isomorphic-fetch';
import https from 'https';
import globals from './Globals';

const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

const msgFormat = (type, success, data) => ({
  type,
  success,
  data
});

const makeK8sReq = (resource, user, reqMethod = 'GET', body = {}) => {
  const promise = new Promise((resolve, reject) => {
    const resourceToUrl = {
      getDepl: `apis/extensions/v1beta1/namespaces/${globals.k8s.userspace}/deployments/${user}`,
      getConfigmap: `api/v1/namespaces/${globals.k8s.userspace}/configmaps/${user}`,
      deletePod: `api/v1/namespaces/${globals.k8s.userspace}/pods/${user}`,
      getLogs: `api/v1/namespaces/${globals.k8s.userspace}/pods/${user.podName}/log?tailLines=${user.tail}`,
      getPods: `api/v1/namespaces/${globals.k8s.userspace}/pods?labelSelector=app%3D${user}`,
      putConfigmap: `api/v1/namespaces/${globals.k8s.userspace}/configmaps/${user}`,
      postDepl: `apis/extensions/v1beta1/namespaces/${globals.k8s.userspace}/deployments`,
      postConfigmap: `api/v1/namespaces/${globals.k8s.userspace}/configmaps`,
      postService: `api/v1/namespaces/${globals.k8s.userspace}/services`,
      getService: `api/v1/namespaces/${globals.k8s.userspace}/services/${user}`,
      putScale: `apis/extensions/v1beta1/namespaces/${globals.k8s.userspace}/deployments/${user}/scale`,
      getRs: `apis/extensions/v1beta1/namespaces/${globals.k8s.userspace}/replicasets?labelSelector=app%3D${user}`
    };
    console.log(`request url ---> ${globals.k8s.url}/${resourceToUrl[resource]} via ${reqMethod} using paramns ${user}`);
    fetch(`${globals.k8s.url}/${resourceToUrl[resource]}`,
      { method: reqMethod,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${globals.k8s.token}`
        },
        agent: httpsAgent,
        body: JSON.stringify(body)
      }).then(
        (response) => {
          if (response.status >= 200 && response.status < 300) {
            if (resource === 'getLogs') {
              response.text().then((data) => {
                try {
                  resolve(data);
                } catch (err) {
                  console.log(err.stack);
                  reject(err.toString());
                }
              });
            } else {
              response.json().then((data) => {
                try {
                  resolve(data);
                } catch (err) {
                  console.log(err.stack);
                  reject(err.toString());
                }
              });
            }
            return;
          }
          reject(`${resourceToUrl[resource]} :: ${user} :: ${response.status.toString()} : ${response.statusText}`);
        },
        (error) => {
          reject(`${resourceToUrl[resource]} :: ${user} :: failed to fetch from k8s: ${error.message}`);
        }
      );
  });
  return promise;
};

const k8sBody = {
  configmap: (user, data) => ({
    kind: 'ConfigMap',
    apiVersion: 'v1',
    metadata: {
      name: user,
      namespace: globals.k8s.userspace,
      labels: {
        app: user
      }
    },
    data
  }),
  service: (user) => ({
    kind: 'Service',
    apiVersion: 'v1',
    metadata: {
      name: user,
      namespace: globals.k8s.userspace,
      labels: {
        app: user
      }
    },
    spec: {
      ports: [
        {
          port: 80,
          targetPort: 80,
          name: 'http'
        }
      ],
      selector: {
        app: user
      }
    }
  }),
  scale: (user, replicas) => ({
    kind: 'Scale',
    apiVersion: 'extensions/v1beta1',
    metadata: {
      name: user,
      namespace: globals.k8s.userspace,
      labels: {
        app: user
      }
    },
    spec: {
      replicas
    }
  }),
  deployment: (user) => ({
    kind: 'Deployment',
    spec: {
      template: {
        spec: {
          containers: [
            {
              image: globals.imad.simpleNodeAppImage,
              volumeMounts: [
                {
                  mountPath: '/app',
                  name: 'file-volume'
                }
              ],
              name: user,
              env: [
                {
                  name: 'USER',
                  value: user
                }
              ],
              ports: [
                {
                  containerPort: 80
                }
              ]
            }
          ],
          volumes: [
            {
              configMap: {
                name: user
              },
              name: 'file-volume'
            }
          ]
        },
        metadata: {
          labels: {
            app: user
          }
        }
      },
      replicas: 1
    },
    apiVersion: 'extensions/v1beta1',
    metadata: {
      namespace: globals.k8s.userspace,
      labels: {
        app: user
      },
      name: user
    }
  })
};

const k8s = {
  getStatus: (name) => {
    const promise = new Promise((resolve, reject) => {
      makeK8sReq('getDepl', name).then(
          (data) => {
            resolve(data);
          },
          (error) => {
            reject(error);
          }
        );
    });
    return promise;
  },
  getLogs: (user, tail) => {
    const promise = new Promise((resolve, reject) => {
      makeK8sReq('getPods', user).then(
        (data) => {
          let podName = '';
          if (data.items.length > 0) {
            podName = data.items[0].metadata.name;
          } else {
            reject(data);
          }
          return makeK8sReq('getLogs', {podName, tail});
        },
        (error) => {
          console.log(error);
          reject(error);
        }
      ).then(
        (data) => {
          resolve(data);
        },
        (error) => {
          console.log(error);
          reject(error);
        }
      );
    });
    return promise;
  },
  updateConfigmap: (user, configmap) => {
    const promise = new Promise((resolve, reject) => {
      const messages = [];
      makeK8sReq('putConfigmap', user, 'PUT', k8sBody.configmap(user, configmap)).then(
          (data) => {
            messages.push(msgFormat('putConfigMap', true, data));
            return makeK8sReq('getPods', user, 'GET');
          },
          (error) => {
            messages.push(msgFormat('putConfigMap', false, error));
            reject(messages);
          }
        ).then(
          (data) => {
            let podName = '';
            if (data.items.length > 0) {
              podName = data.items[0].metadata.name;
            } else {
              reject(data);
            }
            messages.push(msgFormat('getPodName', true, podName));
            return makeK8sReq('deletePod', podName, 'DELETE');
          },
          (error) => {
            messages.push(msgFormat('getPodName', false, error));
            reject(messages);
          }
        ).then(
          (data) => {
            messages.push(msgFormat('deletePod', true, data));
            resolve(messages);
          },
          (error) => {
            messages.push(msgFormat('deletePod', false, error));
            reject(messages);
          }
        );
    });
    return promise;
  },
  stop: (user) => {
    const promise = new Promise((resolve, reject) => {
      const returnData = {
        success: false,
        message: []
      };
      makeK8sReq('getConfigmap', user, 'DELETE').then(
        (data) => {
          returnData.message.push(msgFormat('deleteConfigMap', true, data));
          return makeK8sReq('getService', user, 'DELETE');
        },
        (error) => {
          returnData.message.push(msgFormat('deleteConfigMap', false, error));
          reject(returnData);
        })
      .then(
        (data) => {
          returnData.message.push(msgFormat('deleteService', true, data));
          return makeK8sReq('putScale', user, 'PUT', k8sBody.scale(user, 0));
        },
        (error) => {
          returnData.message.push(msgFormat('deleteService', false, error));
          reject(returnData);
        })
      .then(
        (data) => {
          returnData.message.push(msgFormat('putScale0', true, data));
          return makeK8sReq('getDepl', user, 'DELETE');
        },
        (error) => {
          returnData.message.push(msgFormat('putScale0', false, error));
          reject(returnData);
        })
      .then(
        (data) => {
          returnData.message.push(msgFormat('deleteDeployment', true, data));
          return makeK8sReq('getRs', user, 'DELETE');
        },
        (error) => {
          returnData.message.push(msgFormat('deleteDeployment', false, error));
          reject(returnData);
        })
      .then(
        (data) => {
          returnData.message.push(msgFormat('deleteReplcaSet', true, data));
          returnData.success = true;
          resolve(returnData);
        },
        (error) => {
          returnData.message.push(msgFormat('deleteReplcaSet', false, error));
          reject(returnData);
        }
      );
    });
    return promise;
  },
  start: (user, configmap) => {
    const promise = new Promise((resolve, reject) => {
      const messages = [];
      makeK8sReq('postConfigmap', user, 'POST', k8sBody.configmap(user, configmap)).then(
          (data) => {
            messages.push(msgFormat('postConfigMap', true, data));
            return makeK8sReq('postDepl', user, 'POST', k8sBody.deployment(user));
          },
          (error) => {
            messages.push(msgFormat('postConfigMap', false, error));
            reject(messages);
          }
        ).then(
          (data) => {
            messages.push(msgFormat('postDeployment', true, data));
            return makeK8sReq('postService', user, 'POST', k8sBody.service(user));
          },
          (error) => {
            // revert configmap
            messages.push(msgFormat('postDeployment', false, error));
            reject(messages);
          }
        ).then(
          (data) => {
            messages.push(msgFormat('postService', true, data));
            resolve(messages);
          },
          (error) => {
            // revert deployment
            messages.push(msgFormat('postService', false, error));
            reject(messages);
          }
        );
    });
    return promise;
  }
};

export default {k8s, msgFormat} ;
