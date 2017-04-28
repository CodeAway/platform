import defaultState from './ProjectState';
import requestAction from 'utils/requestAction';
import Endpoints, {globalCookiePolicy} from 'Endpoints';
import Globals from 'Globals';
import {SET_USERPROJECT, SET_DBPASS, SET_SSHPASS} from '../User/Actions';

const CREATE_REQUEST = 'Project/CREATE_REQUEST';
const CREATE_ERROR = 'Project/CREATE_ERROR';
const SET_PROJECT = 'Project/SET_PROJECT';
const WAIT_NOTIFICATION = 'Project/WAIT_NOTIFICATION';

const CREATE_DB_REQUEST = 'Project/CREATE_DB_REQUEST';
const CREATE_DB_ERROR = 'Project/CREATE_DB_ERROR';
const SET_DB = 'Project/SET_DB';
const CREATE_SSH_REQUEST = 'Project/CREATE_SSH_REQUEST';
const CREATE_SSH_ERROR = 'Project/CREATE_SSH_ERROR';
const SET_SSH = 'Project/SET_SSH';

const createProject = (envId) => {
  return (dispatch, getState) => {
    console.log(envId);
    dispatch({type: CREATE_REQUEST});

    // make a request to create the project
    const user = getState().user;
    const forkUrl = `https://api.github.com/repos/hasura-imad/${Globals.repoName}/forks`;
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
        const saveUrl = Endpoints.dataUrl + '/api/1/table/user/update';
        const saveOptions = {
          method: 'POST',
          body: JSON.stringify({$set: {github_project: data}, where: {hasura_id: user.table.hasura_id}}),
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

const createDB = () => {
  return (dispatch) => {
    dispatch({type: CREATE_DB_REQUEST});
    const url = Endpoints.apiUrl + '/create-db';
    const opts = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: globalCookiePolicy
    };
    dispatch(requestAction(url, opts)).then(
      (data) => {
        dispatch({type: SET_DBPASS, data: data.password});
        dispatch({type: SET_DB});
      },
      (error) => {
        console.error(error);
        dispatch({type: CREATE_DB_ERROR, data: error});
      });
  };
};

const createSSH = () => {
  return (dispatch) => {
    dispatch({type: CREATE_SSH_REQUEST});
    const url = Endpoints.apiUrl + '/create-ssh';
    const opts = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: globalCookiePolicy
    };
    dispatch(requestAction(url, opts)).then(
      (data) => {
        dispatch({type: SET_SSHPASS, data: data.password});
        dispatch({type: SET_SSH});
      },
      (error) => {
        console.error(error);
        dispatch({type: CREATE_SSH_ERROR, data: error});
      });
  };
};

const projectReducer = (state = defaultState, action) => {
  switch (action.type) {
    case CREATE_REQUEST:
      return {...state, create: {status: 'ongoing', error: null}};
    case CREATE_ERROR:
      return {...state, create: {status: 'error', error: action.data}};
    case SET_PROJECT:
      return {...state, create: {status: '', error: null}};

    case CREATE_DB_REQUEST:
      return {...state, db: {...state.db, create: {status: 'ongoing', error: null}}};
    case CREATE_DB_ERROR:
      return {...state, db: {...state.db, create: {status: 'error', error: action.data}}};
    case SET_DB:
      return {...state, db: {...state.db, create: {status: '', error: null}}};

    case CREATE_SSH_REQUEST:
      return {...state, ssh: {...state.ssh, create: {status: 'ongoing', error: null}}};
    case CREATE_SSH_ERROR:
      return {...state, ssh: {...state.ssh, create: {status: 'error', error: action.data}}};
    case SET_SSH:
      return {...state, ssh: {...state.ssh, create: {status: '', error: null}}};

    case WAIT_NOTIFICATION:
      return {...state, pleaseWait: action.data};
    default:
      return state;
  }
};

export default projectReducer;
export {createProject, createDB, createSSH};
