import defaultState from './ProjectState';
import requestAction from 'utils/requestAction';
import Endpoints, {globalCookiePolicy} from 'Endpoints';
// import {push} from 'react-router-redux';
// import Globals from 'Globals';
import {SET_USERPROJECT} from '../User/Actions';

const CREATE_REQUEST = 'Project/CREATE_REQUEST';
const CREATE_ERROR = 'Project/CREATE_ERROR';
const SET_PROJECT = 'Project/SET_PROJECT';
const WAIT_NOTIFICATION = 'Project/WAIT_NOTIFICATION';

const createProject = () => {
  return (dispatch, getState) => {
    dispatch({type: CREATE_REQUEST});

    // make a request to create the project
    const user = getState().user;
    const forkUrl = `https://api.github.com/repos/hasura-imad/imad-2016-app/forks`;
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
    case WAIT_NOTIFICATION:
      return {...state, pleaseWait: action.data};
    default:
      return state;
  }
};

export default projectReducer;
export {createProject};
