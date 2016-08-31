import bodyParser from 'body-parser';
import k8s from './k8s';

const jsonParser = bodyParser.json();

const routes = (app) => {
  app.get('/hello', (req, res) => {
    res.send('Hello World');
  });

  app.post('/restart/:user', jsonParser, (req, res) => {
    console.log(req.body);
    const configmapData = req.body;
    const user = req.params.user;
    // get status
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
            res.send(error);
          }
          );
  });
};

export default routes;
