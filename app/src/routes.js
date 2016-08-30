const routes = (app) => {
  app.get('/hello', (req, res) => {
    res.send('Hello World');
  });
};

export default routes;
