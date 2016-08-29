import React from 'react';
import {Router, Route, IndexRoute} from 'react-router'; // eslint-disable-line no-unused-vars

// Load components
import Login from './components/Login/Login';
import Layout from './components/Layout/Layout';
import Home from './components/Home/Home';
import Code from './components/Code/Code';
import Files from './components/Files/Files';

// Main routes
const routes = (history) => {
  return (
    <Router history={history}>
      <Route path="/login" component={Login} />
      <Route path="/" component={Layout}>
        <Route path="home" component={Home} />
        <Route path="code" component={Code}>
          <Route path="files/:fileName" component={Files} />
        </Route>
      </Route>

      {/*
      <Route path="/" component={Layout}>
        <IndexRoute component={Home} />
        <Route path="code" component={Code}>
      </Route>
      <Route path="*" component={NotFound}/>
      */}
    </Router>
  );
};

export default routes;
