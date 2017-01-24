import fetch from 'isomorphic-fetch';
import moment from 'moment';
import cookie from 'cookie';
import bodyParser from 'body-parser';
import {k8s, msgFormat} from './k8s';
import Endpoints from './Endpoints';
import Globals from './Globals';

const jsonParser = bodyParser.json();

let scheme = process.env.SCHEME ? process.env.SCHEME.trim() : '';
scheme = (scheme === '') ? '' : (scheme + ':');

let dbUrl = `http://data.${Globals.imad.namespace}`;
let authUrl = `http://auth.${Globals.imad.namespace}`;
let selfUrl = `http://api.${Globals.imad.namespace}`;

const headers = {
  'Content-Type': 'application/json'
};

if (__DEVELOPMENT__) {
  selfUrl = 'http://localhost:8000';
  authUrl = scheme + '//auth.' + process.env.BASE_DOMAIN;
  dbUrl = scheme + '//data.' + process.env.BASE_DOMAIN;
  headers.Authorization = 'Bearer ' + process.env.TOKEN;
} else {
  headers['X-Hasura-User-Id'] = 1;
  headers['X-Hasura-Role'] = 'admin';
}

const request = (url, options, res, cb) => {
  fetch(url, options).then(
    (response) => {
      if (response.ok) {
        response.json().then(d => (cb(d, response))).catch(e => {
          console.error(e);
          console.log(e.stack);
        });
        return;
      }
      console.error(url, response.status, response.statusText);
      response.text().then(t => (console.log(t)));
      if (res) {
        res.status(500).send('Internal error');
      }
    },
    (e) => {
      console.error(url, e);
      if (res) {
        res.status(500).send('Internal error');
      }
    }).catch(e => {
      console.error(url, e);
      console.error(e.stack);
      if (res) {
        res.status(500).send('Internal error');
      }
    });
};

const simpleFetch = (url, opts, cb) => {
  fetch(url, opts)
    .then(
      (response) => {
        if (response.ok) {
          response.text()
            .then(t => {
              const data = JSON.parse(t);
              cb(data);
            })
            .catch(e => {
              console.error(url, e);
            });
          return;
        }
        response.text().then(t => {
          console.error(url, t);
        });
      },
      (error) => {
        console.error(url, error);
      })
    .catch(e => {
      console.error(url, e);
      console.log(e.stack);
    });
};

const getUserInfo = (req) => ({
  id: parseInt(req.get('X-Hasura-User-Id'), 10),
  role: req.get('X-Hasura-Role')
});

const getUserDetails = (req, res, cb) => {
  const userInfo = getUserInfo(req);
  if (userInfo.role === 'anonymous') {
    res.status(401).send('Unauthorized');
    return;
  }
  const selectUrl = dbUrl + '/api/1/table/user/select';
  const selectOptions = {
    method: 'POST',
    headers,
    body: JSON.stringify({
      columns: ['*'],
      where: {
        hasura_id: userInfo.id
      }
    })
  };
  request(selectUrl, selectOptions, res, (data) => {
    cb(data[0].username, data[0].hasura_id, data[0]);
    return;
  });
};

const upsertAndProceed = (authData, _cookie, res) => { // eslint-disable-line arrow-body-style
  return (ghData) => {
    let upsertUrl = dbUrl + '/api/1/table/user/';
    const upsertOpts = {
      method: 'POST',
      headers
    };
    const object = {};
    let username = ghData.login.toLowerCase();
    if (ghData) {
      if (!isNaN(parseInt(username, 10))) {
        username = `imad-${username}`;
      }
      upsertUrl += 'insert';
      object.objects = [{
        hasura_id: authData.hasura_id,
        username,
        name: ghData.name,
        email: null,
        github_token: authData.access_token
      }];
    } else {
      upsertUrl += 'update';
      object.$set = {github_token: authData.access_token};
      object.where = {hasura_id: authData.hasura_id};
    }

    upsertOpts.body = JSON.stringify(object);
    // Now make upsert request and proceed
    console.log(upsertUrl, upsertOpts);
    request(upsertUrl, upsertOpts, res, () => {
      const redirect = process.env.REDIRECT_URI;
      res.cookie('dinoisses', _cookie.dinoisses, {domain: _cookie.Domain});
      res.redirect(redirect);

      if (ghData) {
        // Also insert a value in the database
        const loggerOpts = {
          method: 'POST',
          headers,
          body: JSON.stringify({
            objects: [{
              username: ghData.login.toLowerCase(),
              last_seen: (new Date()).toISOString()
            }]
          }),
        };

        fetch(dbUrl + '/api/1/table/logger/insert', loggerOpts).then(
          (response) => {
            console.log(response.status);
            response.text().then(t => {
              console.log(t);
            });
          },
          (error) => {
            console.error(error);
          }).catch(e => {
            console.error(e);
          });
      }
    });
  };
};

const routes = (app) => {
  app.get('/hello', (req, res) => {
    // res.send('Hello World');
    res.redirect('/asdf');
  });

  app.get('/create-db', (req, res) => {
    // Get the current user
    getUserDetails(req, res, (username, id, data) => {
      if (data.db_pass && data.db_pass.trim() !== '') {
        res.status(400).send('db-already-created');
        return;
      }

      console.log('Creating for', username);
      const password = 'db-' + username + '-' + Math.ceil(Math.random() * 100000);
      const url = Endpoints.dbUbuntu + '/create-database';
      const opts = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + process.env.UBUNTU
        },
        body: JSON.stringify({username, password})
      };
      request(url, opts, res, () => {
        const updateUrl = dbUrl + '/api/1/table/user/update';
        const updateOpts = {
          method: 'POST',
          headers,
          body: JSON.stringify({
            $set: {db_pass: password},
            where: {hasura_id: id}
          })
        };
        request(updateUrl, updateOpts, res, () => {
          console.log('Database created for user: ' + username);
          res.set('Content-Type', 'application/json');
          res.send(JSON.stringify({password}));
        });
      });
    });
  });

  app.get('/create-ssh', (req, res) => {
    // Get the current user
    getUserDetails(req, res, (username, id, data) => {
      if (data.ssh_pass && data.ssh_pass.trim !== '') {
        res.status(400).send('ssh-already-created');
        return;
      }

      const password = 'ssh-' + username + '-' + Math.ceil(Math.random() * 100000);
      const url = Endpoints.sshUbuntu + '/create-ssh-user';
      const opts = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + process.env.UBUNTU
        },
        body: JSON.stringify({username, password})
      };
      request(url, opts, res, () => {
        const updateUrl = dbUrl + '/api/1/table/user/update';
        const updateOpts = {
          method: 'POST',
          headers,
          body: JSON.stringify({
            $set: {ssh_pass: password},
            where: {hasura_id: id}
          })
        };
        request(updateUrl, updateOpts, res, () => {
          console.log('SSH user created for user: ' + username);
          res.set('Content-Type', 'application/json');
          res.send(JSON.stringify({password}));
        });
      });
    });
  });

  app.get('/github/authenticate', (req, res) => {
    const code = req.query.code;
    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    request(authUrl + '/github/authenticate?code=' + code, options, res, (authData, resObj) => {
      // In case of success extract the API token and redirect to UI
      // Extract the Set-Cookie header and send it to the browser
      // Save this in the database

      const c = cookie.parse(resObj.headers.get('Set-Cookie'));
      if (authData.new_user) {
        const ghOptions = {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'token ' + authData.access_token
          }
        };
        request('https://api.github.com/user', ghOptions, res, upsertAndProceed(authData, c, res));
      } else {
        upsertAndProceed(authData, c, res)();
      }
    });
  });

  app.post('/restart', jsonParser, (req, res) => {
    const gitUrl = req.body.gitUrl;
    const gitRevision = req.body.gitRevision;
    const returnData = {
      success: false,
      message: []
    };
    getUserDetails(req, res, (username, hasuraId, userData) => {
      let user = username;
      if (hasuraId === 1) {
        user = req.query.user;
        if (!user) {
          returnData.message.push(msgFormat('getUserParam', false, 'query param user not found'));
          res.status(400).send(returnData);
          return;
        }
      }
      // If the server is started, the started time stamp should be mentioned in the logger table
      // However, this started timestamp will be refreshed everytime restart is called
      const selectOpts = {
        method: 'POST',
        headers,
        body: JSON.stringify({
          columns: ['*'],
          where: {username: user}
        })
      };
      simpleFetch(dbUrl + '/api/1/table/logger/select', selectOpts, (apps) => {
        if (apps.length && apps[0].last_seen) {
          console.log('Not updating server timestamp for: ', JSON.stringify(apps));
        } else {
          const updateOpts = {
            method: 'POST',
            headers,
            body: JSON.stringify({
              $set: {last_seen: (new Date()).toISOString()},
              where: {username: user}
            })
          };
          simpleFetch(dbUrl + '/api/1/table/logger/update', updateOpts, (result) => {
            console.log('Updated start-server entry for: ', user, JSON.stringify(result));
          });
        }
      });

      k8s.getStatus(user)
        .then(
          (data) => {
            returnData.message.push(msgFormat('getDeployment', true, data));
            // if running, patch deployment with new revision
            return k8s.updateDeployment(data, gitRevision);
          },
          (error) => {
            returnData.message.push(msgFormat('getDeployment', false, error));
            // if not running, start
            const vars = [
              {
                name: 'DB_PASSWORD',
                value: userData.db_pass
              },
              {
                name: 'DB_DATABASE',
                value: user
              },
              {
                name: 'DB_USERNAME',
                value: user
              },
              {
                name: 'DB_HOST',
                value: 'db.imad.hasura-app.io'
              },
              {
                name: 'DB_PORT',
                value: '5432'
              }
            ];
            return k8s.start(user, gitUrl, gitRevision, vars);
          })
        .then(
          (data) => {
            returnData.success = true;
            returnData.message.push(...data);
            res.send(returnData);
          },
          (error) => {
            console.log(error);
            returnData.message.push.apply(...error);
            res.status(500).send(returnData);
          })
        .catch(e => {
          console.log(e);
          console.log(e.stack);
          res.status(500).send('Internal error. Exception thrown');
        });
    });
  });

  app.post('/stop', jsonParser, (req, res) => {
    getUserDetails(req, res, (username, hasuraId) => {
      const returnData = {
        success: false,
        message: []
      };
      let user = username;
      if (hasuraId === 1) {
        user = req.query.user;
        if (!user) {
          returnData.message.push(msgFormat('getUserParam', false, 'query param user not found'));
          res.status(400).send(returnData);
          return;
        }
      }
      k8s.stop(user).then(
        (data) => {
          res.send(data);
        },
        (error) => {
          res.status(500).send(error);
        }
      );
    });
  });

  app.get('/gateway-req', (req, res) => {
    if (req.query.token !== process.env.IMAD_GATEWAY_PASSWORD) {
      res.status(403).send('invalid token');
      return;
    }
    // Save the thing in a log
    res.send('received');
    const url = dbUrl + '/api/1/table/logger/update';
    const username = req.query.username;
    if (!username) {
      console.log('No username found. Updating log entries for all users!');
    }
    const options = {
      method: 'POST',
      body: JSON.stringify({
        $set: {
          last_seen: (new Date()).toISOString()
        },
        where: {username}
      }),
      headers
    };
    fetch(url, options).then(
      (response) => {
        console.log(response.status);
        response.text().then(t => {
          console.log(t);
        });
      },
      (error) => {
        console.error(error);
      }
    );
  });

  app.get('/logs', (req, res) => {
    getUserDetails(req, res, (username, hasuraId) => {
      const returnData = {
        success: false,
        message: []
      };
      let user = username;
      if (hasuraId === 1) {
        user = req.query.user;
        if (!user) {
          returnData.message.push(msgFormat('getUserParam', false, 'query param user not found'));
          res.status(400).send(returnData);
          return;
        }
      }
      const tail = parseInt(req.query.tail, 10) || 100;
      k8s.getLogs(user, tail).then(
        (data) => {
          res.type('json').send({success: true, data});
        },
        (error) => {
          res.status(500).send({success: false, error});
        }
      );
    });
  });

  app.get('/status', (req, res) => {
    getUserDetails(req, res, (username, hasuraId) => {
      const returnData = {
        success: false,
        message: []
      };
      let user = username;
      if (hasuraId === 1) {
        user = req.query.user;
        if (!user) {
          returnData.message.push(msgFormat('getUserParam', false, 'query param user not found'));
          res.status(400).send(returnData);
          return;
        }
      }
      k8s.getDeployment(user).then(
        (data) => {
          res.send(data);
        },
        (error) => {
          res.status(500).send(error);
        }
      );
    });
  });
};

const reap = () => {
  // Fetch everything from the db that is more than x mins old
  const fiveMinsAgo = moment().subtract(parseInt(process.env.REAP_INTERVAL, 10), 'minutes').toISOString();
  console.log(moment().toISOString());
  console.log(fiveMinsAgo);
  const url = dbUrl + '/api/1/table/logger/select';
  const opts = {
    method: 'POST',
    headers,
    body: JSON.stringify({
      columns: ['*'],
      where: {last_seen: {$lt: fiveMinsAgo}}
    })
  };

  simpleFetch(url, opts, (apps) => {
    console.log(apps);
    apps.map((app, i) => { // eslint-disable-line array-callback-return
      const selfOpts = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Hasura-User-Id': 1,
          'X-Hasura-Role': 'admin'
        }};
      setTimeout(() => {
        simpleFetch(selfUrl + '/stop?user=' + app.username, selfOpts, (result) => {
          console.log(result);
        });
        const updateOpts = {
          method: 'POST',
          headers,
          body: JSON.stringify({
            $set: {last_seen: null},
            where: {username: app.username}
          })
        };
        simpleFetch(dbUrl + '/api/1/table/logger/update', updateOpts, (result) => {
          console.log('Deleted entry for: ', app.username, JSON.stringify(result));
        });
      }, (100 * i));
    });
  });
};

export default routes;
export {reap};
