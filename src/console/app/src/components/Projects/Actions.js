import Endpoints, {globalCookiePolicy} from 'Endpoints';
import requestAction from 'utils/requestAction';
// import {push} from 'react-router-redux';
import defaultState from './State.js';

// const CREATE_NEW = 'Project/CREATE_NEW';
const SET_PROJECTS = 'Project/SET_PROJECTS';
const SET_ENVIRONMENTS = 'Project/SET_ENVIRONMENTS';

const defaultOptions = {
  credentials: globalCookiePolicy,
  headers: {'Content-Type': 'application/json'}
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
    default:
      return state;
  }
};

export default projectsReducer;
export {loadEnvironments, loadProjects};
