import fetch from 'isomorphic-fetch';
import https from 'https';
import globals from './Globals';

const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

const k8s = {
  getStatus: (name) => {
    const promise = new Promise((resolve, reject) => {
      makeK8sReq('getDepl', name).then(
          (data) => {
            console.log('success', data);
            resolve(data);
          },
          (error) => {
            console.log('error', error);
            reject(error);
          }
        );
    });
    return promise;
  },
  updateConfigmap: (user, configmap) => {
    const promise = new Promise((resolve, reject) => {
      makeK8sReq('putConfigmap', user, 'PUT', k8sBody.configmap(user, configmap)).then(
          (data) => {
            console.log('success', data);
            return makeK8sReq('getPods', user, 'GET');
          },
          (error) => {
            console.log('error', error);
            reject(error);
          }
        ).then(
          (data) => {
            let podName = '';
            if (data.items.length > 0) {
              podName = data.items[0].metadata.name;
            } else {
              reject(data);
            }
            return makeK8sReq('deletePod', podName, 'DELETE');
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
  stop: (user) => {
    const promise = new Promise((resolve, reject) => {
      makeK8sReq('getConfigmap', user, 'DELETE').then(
        (data) => {
          console.log(data);
          return makeK8sReq('getService', user, 'DELETE');
        },
        (error) => {
          reject(error);
        }
      ).then(
        (data) => {
          console.log(data);
          return makeK8sReq('getDepl', user, 'DELETE');
        },
        (error) => {
          reject(error);
        }
      ).then(
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
  start: (user, configmap) => {
    const promise = new Promise((resolve, reject) => {
      makeK8sReq('postConfigmap', user, 'POST', k8sBody.configmap(user, configmap)).then(
          (data) => {
            console.log('success', data);
            return makeK8sReq('postDepl', user, 'POST', k8sBody.deployment(user));
          },
          (error) => {
            console.log('error', error);
            reject(error);
          }
        ).then(
          (data) => {
            console.log('success', data);
            return makeK8sReq('postService', user, 'POST', k8sBody.service(user));
          },
          (error) => {
            // revert configmap
            console.log('error', error);
            reject(error);
          }
        ).then(
          (data) => {
            console.log('success', data);
            const returnData = {
              success: true,
              message: 'started'
            };
            resolve(returnData);
          },
          (error) => {
            // revert deployment
            console.log('error', error);
            reject(error);
          }
        );
    });
    return promise;
  }
};

const makeK8sReq = (resource, user, reqMethod = 'GET', body = {}) => {
  const promise = new Promise((resolve, reject) => {
    const resourceToUrl = {
      getDepl: `apis/extensions/v1beta1/namespaces/${globals.k8s.userspace}/deployments/${user}`,
      getConfigmap: `api/v1/namespaces/${globals.k8s.userspace}/configmaps/${user}`,
      deletePod: `api/v1/namespaces/${globals.k8s.userspace}/pods/${user}`,
      getPods: `api/v1/namespaces/${globals.k8s.userspace}/pods?labelSelector=app%3D${user}`,
      putConfigmap: `api/v1/namespaces/${globals.k8s.userspace}/configmaps/${user}`,
      postDepl: `apis/extensions/v1beta1/namespaces/${globals.k8s.userspace}/deployments`,
      postConfigmap: `api/v1/namespaces/${globals.k8s.userspace}/configmaps`,
      postService: `api/v1/namespaces/${globals.k8s.userspace}/services`,
      getService: `api/v1/namespaces/${globals.k8s.userspace}/services/${user}`
    };
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
          console.log(body);
          if (response.status >= 200 && response.status < 300) {
            response.json().then((data) => {
              try {
                resolve(data);
              } catch (err) {
                console.log(err.stack);
                reject(err.toString());
              }
            });
            return;
          }
          reject(`${resourceToUrl[resource]} :: ${user} ::
              ${response.status.toString()} : ${response.statusText}`);
        },
        (error) => {
          reject(`${resourceToUrl[resource]} :: ${user} :: 
              failed to fetch from k8s: ${error.message}`);
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
          targetPort: 8080,
          name: 'http'
        }
      ],
      selector: {
        app: user
      }
    }
  }),
  deployment: (user) => ({
    kind: 'Deployment',
    spec: {
      template: {
        spec: {
          containers: [
            {
              image: 'hasura/simple-node-web-app:1.0',
              volumeMounts: [
                {
                  mountPath: '/app/src',
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

export default k8s ;
