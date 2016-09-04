import React from 'react';
import {Router, Route, IndexRedirect} from 'react-router';

// Load components
import Login from './components/Login/Login';
import Layout from './components/Layout/Layout';
import LayoutNoNav from './components/LayoutNoNav/Layout';
import Home from './components/Home/Home';
import Docs from './components/Docs/Docs';
import Code from './components/Code/Code';
import Logs from './components/Logs/Logs';
import CodeHome from './components/Code/Home';
import Files from './components/Files/Files';
import {loadUser} from './components/User/Actions';
import {loadRepo} from './components/Code/Actions';

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

  const requireFiles = (nextState, replaceState, cb) => {
    const state = store.getState();
    if (!state.code || !state.code.gitTree || !state.code.files) {
      const dispatch = store.dispatch;
      dispatch(loadRepo()).then(
        () => {
          cb();
        },
        () => {
          replaceState('/home');
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
          <Route path="docs" component={Docs} />
        </Route>
        <Route path="/" component={LayoutNoNav} onEnter={requireUser}>
          <Route path="code" component={Code} onEnter={requireFiles}>
            <IndexRedirect to="home" />
            <Route path="logs" component={Logs} />
            <Route path="home" component={CodeHome} />
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
