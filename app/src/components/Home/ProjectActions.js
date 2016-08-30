import defaultState from './ProjectState';
import requestAction from 'utils/requestAction';
import Endpoints, {globalCookiePolicy} from 'Endpoints';

const CREATE_REQUEST = 'Project/CREATE_REQUEST';
const CREATE_ERROR = 'Project/CREATE_ERROR';
const SET_PROJECT = 'Project/SET_PROJECT';

const createTimeoutPromise = (dispatch, timeout, url, options) => {
  return new Promise((resolve, reject) => {
    setTimeout(
      () => {
        dispatch(requestAction(url, options)).then(
          () => { resolve(); },
          (error) => { reject(error); }
        );
      },
      timeout);
  });
};
const createProject = () => {
  return (dispatch, getState) => {
    dispatch({type: CREATE_REQUEST});

    // make a request to create the project
    const user = getState().user;
    const createUrl = 'https://api.github.com/user/repos';
    const options = {
      method: 'POST',
      body: JSON.stringify({name: 'imad-2016-base', description: 'My source code repository for the IMAD course app!', gitignore_template: 'Node'}),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'token ' + user.table.github_token
      },
      credentials: 'omit'
    };
    dispatch(requestAction(createUrl, options)).then(
      (data) => {
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
            const serverjs = require('raw!./templates/server.js');
            const packageJson = require('raw!./templates/package.json');
            const html = require('raw!./templates/ui/index.html');
            const js = require('raw!./templates/ui/main.js');
            const css = require('raw!./templates/ui/style.css');

            const baseFileUrl = 'https://api.github.com/repos/coco98/imad-2016-base/contents/';
            const baseOptions = {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'token ' + user.table.github_token
              },
              credentials: 'omit'
            };
            Promise.all([
              createTimeoutPromise(dispatch,
                0,
                baseFileUrl + 'src%2Fui%2Findex.html',
                {...baseOptions, body: JSON.stringify({message: 'Adds src/ui/index.html', content: window.btoa(html)})}),
              createTimeoutPromise(dispatch,
                500,
                baseFileUrl + 'src%2Fui%2Fmain.js',
                {...baseOptions, body: JSON.stringify({message: 'Adds src/ui/main.js', content: window.btoa(js)})}),
              createTimeoutPromise(dispatch,
                1000,
                baseFileUrl + 'src%2Fui%2Fstyle.css',
                {...baseOptions, body: JSON.stringify({message: 'Adds src/ui/style.css', content: window.btoa(css)})}),
              createTimeoutPromise(dispatch,
                1500,
                baseFileUrl + 'src%2Fserver.js',
                {...baseOptions, body: JSON.stringify({message: 'Adds src/server.js', content: window.btoa(serverjs)})}),
              createTimeoutPromise(dispatch,
                2000,
                baseFileUrl + 'package.json',
                {...baseOptions, body: JSON.stringify({message: 'Adds package.json', content: window.btoa(packageJson)})})
            ]).then(
              () => {
                dispatch({type: SET_PROJECT, data: data});
              },
              (error) => {
                dispatch({type: CREATE_ERROR, data: error});
              });
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
      return {...state, create: {status: '', error: null}, data: action.data};
    default:
      return state;
  }
};

export default projectReducer;
export {createProject};
