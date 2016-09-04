import fetch from 'isomorphic-fetch';
import cookie from 'cookie';
import bodyParser from 'body-parser';
import k8s from './k8s';
import Endpoints from './Endpoints';

const jsonParser = bodyParser.json();

let dbUrl;
const headers = {
  'Content-Type': 'application/json'
};

if (__DEVELOPMENT__) {
  dbUrl = 'http://data.imad-stg.hasura-app.io';
  headers.Authorization = 'Bearer ' + process.env.TOKEN;
} else {
  dbUrl = 'http://data.default';
  headers['X-Hasura-User-Id'] = 1;
  headers['X-Hasura-Role'] = 'admin';
}


const request = (url, options, res, cb) => {
  fetch(url, options).then(
    (response) => {
      if (response.ok) {
        response.json().then(d => (cb(d, response)));
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

    if (ghData) {
      upsertUrl += 'insert';
      object.objects = [{
        hasura_id: authData.hasura_id,
        username: ghData.login,
        name: ghData.name,
        email: ghData.email,
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
      const url = Endpoints.ubuntu + '/create-database';
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
      const url = Endpoints.ubuntu + '/create-ssh-user';
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

    request(Endpoints.auth + '/github/authenticate?code=' + code, options, res, (authData, resObj) => {
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
    const configmapData = req.body;
    getUserDetails(req, res, (username, hasuraId) => {
      let user = username;
      if (hasuraId === 1) {
        user = req.query.user;
        if (!user) {
          res.status(400).send('query param user not found');
          return;
        }
      }
      k8s.getStatus(user).then(
          (data) => {
            console.log(data);
            // if running, updateconfigmap
            return k8s.updateConfigmap(user, configmapData);
          },
          (error) => {
            console.log(error);
            // if not running, start
            return k8s.start(user, configmapData);
          }).then(
            (data) => {
              res.send(data);
            },
            (error) => {
              res.status(500).send(error);
            }
            );
    });
  });

  app.post('/stop', jsonParser, (req, res) => {
    getUserDetails(req, res, (username, hasuraId) => {
      let user = username;
      if (hasuraId === 1) {
        user = req.query.user;
        if (!user) {
          res.status(400).send('query param user not found');
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

  app.get('/logs', (req, res) => {
    getUserDetails(req, res, (username, hasuraId) => {
      let user = username;
      if (hasuraId === 1) {
        user = req.query.user;
        if (!user) {
          res.status(400).send('query param user not found');
          return;
        }
      }
      const tail = 100 || req.query.tail;
      k8s.getLogs(user, tail).then(
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

export default routes;
