import Endpoints, {globalCookiePolicy} from 'Endpoints';
// import {push} from 'react-router-redux';
import defaultState from './State.js';
import requestAction from 'utils/requestAction';
// import Globals from 'Globals';
import {SET_USERPROJECT} from '../User/Actions';

const defaultOptions = {
  credentials: globalCookiePolicy,
  headers: {'Content-Type': 'application/json'}
};

// const CREATE_NEW = 'Project/CREATE_NEW';
const SET_PROJECTS = 'Project/SET_PROJECTS';
const SET_CURRENT_PROJECT = 'Project/SET_CURRENT_PROJECT';
const SET_ENVIRONMENTS = 'Project/SET_ENVIRONMENTS';
const SET_NEW_ENV_ID = 'Project/SET_NEW_ENV_ID';
const CREATE_REQUEST = 'Project/CREATE_REQUEST';
const CREATE_ERROR = 'Project/CREATE_ERROR';
const SET_PROJECT = 'Project/SET_PROJECT';
const WAIT_NOTIFICATION = 'Project/WAIT_NOTIFICATION';


const createProject = () => {
  return (dispatch, getState) => {
    dispatch({type: CREATE_REQUEST});

    const state = getState();
    // make a request to create the project
    const user = state.user;
    const newEnv = state.projects.environments.filter((env) => {
      if (env.id === state.projects.newEnvId) {
        return env;
      }
    });
    const forkUrl = `${newEnv.repo}/forks`;
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'token ' + user.table.github_token
      },
      credentials: 'omit'
    };
    dispatch(requestAction(forkUrl, options)).then(
      (data) => {
        // Make a request to save this to the user's table
        const saveUrl = Endpoints.dataUrl + '/v1/query';
        const saveOptions = {
          method: 'POST',
          body: JSON.stringify({
            type: 'insert',
            args: {
              table: 'project',
              objects: [{
                user_id: user.auth.hasura_id,
                environment_id: newEnv.id,
                project: data,
                name: newEnv.name
              }]
            }
          }),
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: globalCookiePolicy
        };
        dispatch(requestAction(saveUrl, saveOptions)).then(
          () => {
            // Update the user's project state
            dispatch({type: WAIT_NOTIFICATION, data: true});
            setTimeout(() => (dispatch({type: WAIT_NOTIFICATION, data: false})), 10000);
            dispatch({type: SET_USERPROJECT, data: data});
            dispatch({type: SET_CURRENT_PROJECT, data: data});
            dispatch({type: SET_PROJECT});
            // dispatch(push('/code'));
          },
          (error) => {
            dispatch({type: CREATE_ERROR, data: error});
          });
      },
      (error) => {
        dispatch({type: CREATE_ERROR, data: error});
      });
    // make a request to load all the files
    //
  };
};

const loadProjects = () => {
  return (dispatch, getState) => {
    const queryUrl = Endpoints.dataUrl + '/v1/query';
    const options = {
      ...defaultOptions,
      method: 'POST',
      body: JSON.stringify({
        type: 'select',
        args: {
          table: 'project',
          columns: [
            'id',
            'project',
            'name',
            'created_at',
            'environment_id'
          ]
        }
      })
    };

    if (!getState().projects || !getState().projects.list) {
      const p = new Promise((resolve, reject) => {
        dispatch(requestAction(queryUrl, options)).then(
          (data) => {
            if (data.length) {
              dispatch({type: SET_PROJECTS, data: data});
              resolve();
            } else {
              reject();
            }
          },
          () => {
            reject();
          });
      });

      return p;
    }
  };
};

const loadEnvironments = () => {
  return (dispatch, getState) => {
    const queryUrl = Endpoints.dataUrl + '/v1/query';
    const options = {
      ...defaultOptions,
      method: 'POST',
      body: JSON.stringify({
        type: 'select',
        args: {
          table: 'environment',
          columns: ['*']
        }
      })
    };

    if (!getState().projects || !getState().projects.environments) {
      const p = new Promise((resolve, reject) => {
        dispatch(requestAction(queryUrl, options)).then(
          (data) => {
            if (data.length) {
              dispatch({type: SET_ENVIRONMENTS, data: data});
              resolve();
            } else {
              reject();
            }
          },
          () => {
            reject();
          });
      });

      return p;
    }
  };
};

const projectsReducer = (state = defaultState, action) => {
  switch (action.type) {
    case SET_PROJECTS:
      return {...state, list: action.data};
    case SET_ENVIRONMENTS:
      return {...state, environments: action.data};
    case SET_NEW_ENV_ID:
      return {...state, newEnvId: action.data};
    case SET_CURRENT_PROJECT:
      return {...state, current: action.data};
    case CREATE_REQUEST:
      return {...state, create: {status: 'ongoing', error: null}};
    case CREATE_ERROR:
      return {...state, create: {status: 'error', error: action.data}};
    case SET_PROJECT:
      return {...state, create: {status: '', error: null}};

    case WAIT_NOTIFICATION:
      return {...state, pleaseWait: action.data};
    default:
      return state;
  }
};

export default projectsReducer;
export {createProject, loadEnvironments, loadProjects};
