import React from 'react';
import {Router, Route, IndexRedirect} from 'react-router';

// Load components
import Login from './components/Login/Login';
import Email from './components/Email/Email';
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
import {loadProjects, loadEnvironments} from './components/Projects/Actions';

const createRoutes = (store) => {
  const requireProjects = (nextState, replaceState, cb) => {
    const state = store.getState();
    if (!state.projects || !state.projects.list || !state.projects.environments) {
      const dispatch = store.dispatch;
      dispatch(loadProjects()).then(
        () => {
          return dispatch(loadEnvironments());
        },
        () => {
          cb();
        }).then(
        () => {
          cb();
        },
        () => {
          cb();
        });
    } else {
      cb();
    }
  };
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

  const requireUserEmail = (nextState, replaceState, cb) => {
    const state = store.getState();
    if (!state.user || !state.user.auth || !state.user.table) {
      const dispatch = store.dispatch;
      dispatch(loadUser()).then(
        () => {
          if (!store.getState().user.table.email) {
            replaceState('/email');
            cb();
          } else {
            cb();
          }
        },
        () => {
          replaceState('/login');
          cb();
        });
    } else {
      if (!state.user.table.email) {
        replaceState('/email');
        cb();
      } else {
        cb();
      }
    }
  };

  const requireFiles = (nextState, replaceState, cb) => {
    const state = store.getState();
    const projectId = nextState.params.projectId;
    let refresh = true;
    if (state.projects.current) {
      refresh = state.projects.current.id === parseInt(projectId, 10);
    }
    if (!refresh || !state.code || !state.code.gitTree || !state.code.files) {
      const dispatch = store.dispatch;
      let clear = false;
      if (!refresh) {clear = true;}
      dispatch(loadProjects(projectId)).then(
        () => {
          return dispatch(loadRepo(clear));
        },
        () => {
          cb();
        }).then(
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
        <Route path="/email" component={Email} onEnter={requireUser} />
        <Route path="/" component={Layout} onEnter={requireUserEmail}>
          <IndexRedirect to="home" />
          <Route path="home" component={Home} onEnter={requireProjects} />
          <Route path="docs" component={Docs} />
        </Route>
        <Route path="/" component={LayoutNoNav} onEnter={requireUserEmail}>
          <Route path="code/:projectId" component={Code} onEnter={requireFiles}>
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
