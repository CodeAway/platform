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
      getRs: `apis/extensions/v1beta1/namespaces/${globals.k8s.userspace}/replicasets?labelSelector=app%3D${user}`,
      putRs: `apis/extensions/v1beta1/namespaces/${globals.k8s.userspace}/replicasets/${user}`
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
          console.log('makeK8srequest returned non 200');
          response.text().then(t => {
            console.log(response.status);
            console.log(t);
          });
          reject(`${resourceToUrl[resource]} :: ${user} :: ${response.status.toString()} : ${response.statusText}`);
        },
        (error) => {
          reject(`${resourceToUrl[resource]} :: ${user} :: failed to fetch from k8s: ${error.message}`);
        }
      );
  });
  return promise;
};

const waitTillDesiredGeneration = (resource, user, desiredGeneration, retries = 0) => (
  // Make a get request, check if equal, if not, repeat
  new Promise((resolve, reject) => {
    console.log('waitTillDesiredGeneration: ' + user + ' retries: ' + retries.toString());
    makeK8sReq(resource === 'deployment' ? 'getDepl' : 'getRs', user)
      .then(
        (current) => {
          console.log('DesiredGeneration: ', desiredGeneration, ' CurrentGeneration: ', current.status.observedGeneration, ' Replicas: ', current.spec.replicas);
          if (current.status.observedGeneration >= desiredGeneration) {
            resolve(current);
          } else {
            setTimeout(() => {
              waitTillDesiredGeneration(user, desiredGeneration, retries + 1)
                .then(
                  (finalDeployment) => {
                    resolve(finalDeployment);
                  },
                  (error) => {
                    console.error('waitTillDesiredGeneration: setTimeout: ', error);
                    if (error.stack) { console.log(error.stack); }
                    reject(error);
                  })
                .catch(error => {
                  console.error('waitTillDesiredGeneration: setTimeout: ', error);
                  console.log(error.stack);
                  reject(error);
                });
            }, 100);
          }
        },
        (error) => {
          console.error('waitTillDesiredGeneration: ', error);
          if (error.stack) { console.log(error.stack); }
          reject(error);
        })
      .catch(error => {
        console.error('waitTillDesiredGeneration: ', error);
        console.log(error.stack);
        reject(error);
      });
  })
);

const stopDeployment = (user) => (
  new Promise((resolve, reject) => {
    // Get the deployment
    makeK8sReq('getDepl', user)
      .then(
        (_deployment) => {
          const deployment = JSON.parse(JSON.stringify(_deployment));
          deployment.spec.replicas = 0;
          makeK8sReq('getDepl', user, 'PUT', deployment)
            .then(
              (setDeployment) => {
                const desiredGeneration = setDeployment.status.observedGeneration + 1;
                waitTillDesiredGeneration('deployment', user, desiredGeneration)
                  .then(
                    (finalDeployment) => {
                      resolve(finalDeployment);
                    },
                    (error) => {
                      console.error('stopDeployment > getDepl > putDepl > waitTillDesiredGeneration error', error);
                      if (error.stack) { console.log(error.stack); }
                      reject(error);
                    })
                  .catch(error => {
                    console.error('stopDeployment > getDepl > putDepl > waitTillDesiredGeneration error', error);
                    console.log(error.stack);
                    reject(error);
                  });
              },
              (error) => {
                console.error('stopDeployment > getDepl > putDepl error', error);
                if (error.stack) { console.log(error.stack); }
                reject(error);
              })
            .catch(error => {
              console.error('stopDeployment > getDepl > putDepl error', error);
              console.log(error.stack);
              reject(error);
            });
        },
        (error) => {
          console.error('stopDeployment > getDepl error', error);
          if (error.stack) { console.log(error.stack); }
          reject(error);
        })
      .catch(error => {
        console.error('stopDeployment > getDepl error', error);
        console.log(error.stack);
        reject(error);
      });
  })
);

const stopReplicaset = (user) => (
  new Promise((resolve, reject) => {
    // Get the deployment
    makeK8sReq('getRs', user)
      .then(
        (_replicasetList) => {
          const replicasetList = JSON.parse(JSON.stringify(_replicasetList));
          const replicaset = replicasetList.items[0];
          const replicasetName = replicaset.metadata.name;
          replicaset.spec.replicas = 0;
          makeK8sReq('putRs', replicasetName, 'PUT', replicaset)
            .then(
              (setReplicaset) => {
                const desiredGeneration = setReplicaset.status.observedGeneration + 1;
                waitTillDesiredGeneration('replicaset', replicasetName, desiredGeneration)
                  .then(
                    (finalReplicaset) => {
                      resolve(finalReplicaset);
                    },
                    (error) => {
                      console.error('stopReplicaset > getRs > putRs > waitTillDesiredGeneration error', error);
                      if (error.stack) { console.log(error.stack); }
                      reject(error);
                    })
                  .catch(error => {
                    console.error('stopReplicaset > getRs > putRs > waitTillDesiredGeneration error', error);
                    console.log(error.stack);
                    reject(error);
                  });
              },
              (error) => {
                console.error('stopReplicaset > getRs > putRs error', error);
                if (error.stack) { console.log(error.stack); }
                reject(error);
              })
            .catch(error => {
              console.error('stopReplicaset > getRs > putRs error', error);
              console.log(error.stack);
              reject(error);
            });
        },
        (error) => {
          console.error('stopReplicaset > getRs error', error);
          if (error.stack) { console.log(error.stack); }
          reject(error);
        })
      .catch(error => {
        console.error('stopReplicaset > getRs error', error);
        console.log(error.stack);
        reject(error);
      });
  })
);

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
  deployment: (user, gitUrl, gitRevision) => ({
    kind: 'Deployment',
    spec: {
      revisionHistoryLimit: 0,
      template: {
        spec: {
          containers: [
            {
              image: globals.imad.simpleNodeAppImage,
              volumeMounts: [
                {
                  mountPath: '/app',
                  name: 'git-volume'
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
                  containerPort: 8080
                }
              ]
            }
          ],
          volumes: [
            {
              gitRepo: {
                repository: gitUrl,
                revision: gitRevision
              },
              name: 'git-volume'
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
          let returnVal;
          if (data.items.length > 0) {
            podName = data.items[0].metadata.name;
          }
          if (!podName) {
            reject(data);
            returnVal = Promise.reject();
          } else {
            returnVal = makeK8sReq('getLogs', {podName, tail});
          }
          return returnVal;
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
  updateDeployment: (oldDeployment, gitRevision) => {
    const promise = new Promise((resolve, reject) => {
      const messages = [];
      const newDeployment = JSON.parse(JSON.stringify(oldDeployment));
      console.log(newDeployment.spec.template.spec);
      newDeployment.spec.template.spec.volumes[0].gitRepo.revision = gitRevision;
      // The user info is the name of the deployment
      makeK8sReq('getDepl', oldDeployment.metadata.name, 'PUT', newDeployment)
        .then(
          (data) => {
            messages.push(msgFormat('putDeployment', true, data));
            resolve(messages);
          },
          (error) => {
            messages.push(msgFormat('putDeployment', false, error));
            reject(messages);
          });
    });
    return promise;
  },
  stop: (user) => {
    const promise = new Promise((resolve, reject) => {
      const returnData = {
        success: false,
        message: []
      };
      makeK8sReq('getService', user, 'DELETE')
        .then(
          (data) => {
            returnData.message.push(msgFormat('deleteService', true, data));
            // stop deployment
            return stopDeployment(user);
          },
          (error) => {
            returnData.message.push(msgFormat('deleteService', false, error));
            reject(returnData);
          })
        .then(
            (data) => {
              returnData.message.push(msgFormat('stopDeployment', true, data));
              return stopReplicaset(user);
            },
            (error) => {
              returnData.message.push(msgFormat('stopDeployment', false, error));
              reject(returnData);
            })
        .then(
          (data) => {
            returnData.message.push(msgFormat('stopReplicaset', true, data));
            return makeK8sReq('getRs', user, 'DELETE');
          },
          (error) => {
            returnData.message.push(msgFormat('stopReplicaset', false, error));
            reject(returnData);
          })
        .then(
          (data) => {
            returnData.message.push(msgFormat('deleteReplcaSet', true, data));
            return makeK8sReq('getDepl', user, 'DELETE');
          },
          (error) => {
            returnData.message.push(msgFormat('deleteReplcaSet', false, error));
            reject(returnData);
          })
        .then(
          (data) => {
            returnData.message.push(msgFormat('deleteDeployment', true, data));
            returnData.success = true;
            resolve(returnData);
          },
          (error) => {
            returnData.message.push(msgFormat('deleteDeployment', false, error));
            reject(returnData);
          }
        );
    });
    return promise;
  },
  start: (user, gitUrl, gitRevision) => {
    const promise = new Promise((resolve, reject) => {
      const messages = [];
      console.log(k8sBody.deployment(user, gitUrl, gitRevision));
      makeK8sReq('postDepl', user, 'POST', k8sBody.deployment(user, gitUrl, gitRevision))
        .then(
          (data) => {
            messages.push(msgFormat('postDeployment', true, data));
            return makeK8sReq('postService', user, 'POST', k8sBody.service(user));
          },
          (error) => {
            // revert configmap
            messages.push(msgFormat('postDeployment', false, error));
            reject(messages);
          })
        .then(
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
  },
  getDeployment: (user) => {
    const promise = new Promise((resolve, reject) => {
      const returnData = {
        success: false,
        message: []
      };
      makeK8sReq('getDepl', user).then(
        (data) => {
          returnData.success = true;
          returnData.message.push(msgFormat('getDeployment', true, data));
          resolve(returnData);
        },
        (error) => {
          returnData.message.push(msgFormat('getDeployment', false, error));
          reject(returnData);
        }
      );
    });
    return promise;
  }
};

export default {k8s, msgFormat} ;
