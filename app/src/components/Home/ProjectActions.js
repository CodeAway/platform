import defaultState from './ProjectState';
import requestAction from 'utils/requestAction';
import Endpoints, {globalCookiePolicy} from 'Endpoints';

const CREATE_REQUEST = 'Project/CREATE_REQUEST';
const CREATE_ERROR = 'Project/CREATE_ERROR';
const SET_PROJECT = 'Project/SET_PROJECT';

const createProject = () => {
  return (dispatch, getState) => {
    dispatch({type: CREATE_REQUEST});

    // make a request to create the project
    const user = getState().user;
    const createUrl = 'https://api.github.com/user/repos';
    const options = {
      method: 'POST',
      body: JSON.stringify({name: 'imad-2016-base', description: 'My source code repository for the IMAD course app!'}),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'token ' + user.table.github_token
      },
      credentials: 'omit'
    };
    dispatch(requestAction(createUrl, options)).then(
      (data) => {
        console.log(data);
        dispatch({type: SET_PROJECT, data: data});
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
          () => {},
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
      return {...state, create: {status: '', error: null}, data: action.data};
    default:
      return state;
  }
};

export default projectReducer;
export {createProject};
