import React from 'react';
import {Router, Route, IndexRedirect} from 'react-router';

// Load components
import Login from './components/Login/Login';
import Layout from './components/Layout/Layout';
import Home from './components/Home/Home';
import Code from './components/Code/Code';
import Files from './components/Files/Files';
import {loadUser} from './components/User/Actions';

const createRoutes = (store) => {
  const requireUser = (nextState, replaceState, cb) => {
    const state = store.getState();
    if (!state.user || !state.user.auth || !state.user.table) {
      const dispatch = store.dispatch;
      dispatch(loadUser()).then(
        () => {
          cb();
        },
        () => {
          replaceState('/login');
          cb();
        });
    } else {
      cb();
    }
  };

  // Main routes
  const routes = (history) => {
    return (
      <Router history={history}>
        <Route path="/login" component={Login} />
        <Route path="/" component={Layout} onEnter={requireUser}>
          <IndexRedirect to="home" />
          <Route path="home" component={Home} />
          <Route path="code" component={Code}>
            <Route path="files/:fileName" component={Files} />
          </Route>
        </Route>
        {/* <Route path="*" component={NotFound}/> */}
      </Router>
    );
  };
  return routes;
};

export default createRoutes;
