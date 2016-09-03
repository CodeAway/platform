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
  const selectUrl = dbUrl + '/api/1/table/user/select';
  const selectOptions = {
    method: 'POST',
    headers,
    body: JSON.stringify({
      columns: ['name', 'email', 'username'],
      where: {
        hasura_id: getUserInfo(req).id
      }
    })
  };
  request(selectUrl, selectOptions, res, (data) => {
    cb(data[0].username, data[0].hasura_id, data);
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
};

export default routes;
