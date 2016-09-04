import defaultState from './State';
import requestAction from 'utils/requestAction';
import Globals from 'Globals';
import Endpoints, {globalCookiePolicy} from 'Endpoints';
import {loadingOn, loadingOff} from '../Layout/Actions';

const SET_TREE = 'Code/SET_TREE';
const SET_FILE = 'Code/SET_FILE';
const INITIALISED = 'Code/INITIALISED';
const SET_CODELOADING = 'Code/LOADING';
const EDIT_FILE = 'Code/EDIT_FILE';

const isValid = (path) => {
  if (path.endsWith('.js') || path.endsWith('.css') || path.endsWith('.html')) {
    return true;
  }
  return false;
};

const loadRepo = () => {
  return (dispatch, getState) => {
    dispatch(loadingOn());
    const user = getState().user;
    const treeUrl = `https://api.github.com/repos/${user.table.username}/${Globals.repoName}/git/trees/master?recursive=1`;
    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'token ' + user.table.github_token
      },
      credentials: 'omit'
    };

    // Load all files from github
    return new Promise((resolve, reject) => {
      dispatch(requestAction(treeUrl, options, SET_TREE)).then(
        (treeData) => {
          // Now we have the tree, and we want to fetch our base files
          const baseFiles = ['server.js', 'index.html', 'style.css', 'main.js'];

          // const baseFiles = ['server.js', 'ui/index.html', 'ui/style.css', 'ui/main.js'];
          const blobs = {};
          treeData.tree.map(f => {
            if (f.type === 'blob' && isValid(f.path)) {
              blobs[f.path] = f.url;
            }
          });

          // Check for all base files
          let noBaseFiles = 0;
          const allFiles = Object.keys(blobs);
          baseFiles.map(f => {
            if (allFiles.indexOf(f) > -1 ) {
              noBaseFiles += 1;
            }
          });
          if (noBaseFiles !== 4) {
            alert('Could not find one of (server.js, index.html, style.css, main.js) in the repo. Please contact support for help.');
            dispatch(loadingOff());
            reject();
            return;
          }

          // Fetch all the files
          Promise.all(allFiles.map(f => {
            return dispatch(requestAction(blobs[f], options)).then(data => {
              dispatch({type: SET_FILE, data: {name: f, sha: data.sha, content: window.atob(data.content)}});
            });
          })).then(
            () => {
              dispatch({type: INITIALISED});
              dispatch(loadingOff());
              resolve();
            },
            (error) => {
              alert(`Could not fetch a file from github. Please try refreshing the page, or contact support if the problem persists.\n
                Error: ${JSON.stringify(error)}`);
              dispatch(loadingOff());
              reject();
            });
        },
        () => {
          alert('Could not fetch files from github. Try again or contact support if this problem persists');
          dispatch(loadingOff());
          reject();
        }
      );
    });
  };
};

const commitFiles = () => {
  return (dispatch, getState) => {
    // Get a list of all the dirty files
    // Save them one by one. For every file that is saved, dispatch SET_FILE, EDIT_FILE

    // Get list of dirty files
    const state = getState().code;
    const user = getState().user;
    const files = Object.keys(state.files);
    const newFiles = {};
    files.map(f => {
      if (state.editFiles[f].dirty) {
        newFiles[f] = state.editFiles[f].content;
      }
    });

    // Promise then functions per file
    const success = (f, resolve) => {
      return (data) => {
        dispatch({type: SET_FILE, data: {name: f, content: newFiles[f], sha: data.content.sha}});
        dispatch({type: EDIT_FILE, data: {fileName: f, content: newFiles[f]}});
        resolve();
      };
    };
    const abort = (f, reject) => {
      return () => {
        alert('Commit failed for: ' + f + '. Please try again or contact support if this persists.');
        reject();
      };
    };

    // Fetch vars
    const updateUrl = (file) => (`https://api.github.com/repos/${user.table.username}/${Globals.repoName}/contents/${encodeURIComponent(file)}`);
    const options = (f) => ({
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'token ' + user.table.github_token
      },
      body: JSON.stringify({
        path: f,
        content: window.btoa(newFiles[f]),
        message: '[imad-console] Updates ' + f,
        sha: state.shas[f]
      }),
      credentials: 'omit'
    });

    // Finally, the promise
    return Promise.all(Object.keys(newFiles).map((f, i) => {
      return new Promise((resolve, reject) => {
        setTimeout(
          () => {
            dispatch(requestAction(updateUrl(f), options(f))).then(success(f, resolve), abort(f, reject));
          }, i * 500);
      });
    }));
  };
};

const startApp = () => {
  return (dispatch, getState) => {
    dispatch({type: SET_CODELOADING, loading: true});
    // Create the configmap & make an API request
    const state = getState().code;
    // const user = getState().user;

    const configmap = {};
    const files = Object.keys(state.editFiles);
    files.map(f => {
      configmap[f] = state.editFiles[f].content;
    });

    const url = Endpoints.apiUrl + '/restart'; // + user.table.username;
    const options = {
      method: 'POST',
      body: JSON.stringify(configmap),
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: globalCookiePolicy
    };

    return dispatch(requestAction(url, options)).then(
      () => {
        setTimeout(() => { dispatch({type: SET_CODELOADING, loading: false}); }, 1000);
      },
      (error) => {
        console.error(error);
        dispatch({type: SET_CODELOADING, loading: false});
      });
  };
};

// /////////////////////////////////////////////////////////////

const codeReducer = (state = defaultState, action) => {
  switch (action.type) {
    case SET_TREE:
      return {...state, gitTree: action.data};
    case SET_FILE:
      const files = state.files ? state.files : {};
      const shas = state.shas ? state.shas : {};
      return {...state,
        files: {...files, [action.data.name]: action.data.content},
        shas: {...shas, [action.data.name]: action.data.sha},
      };
    case INITIALISED:
      const editFiles = {};
      Object.keys(state.files).map(f => {
        editFiles[f] = { content: state.files[f], dirty: false};
      });
      return {...state, status: 'loaded', editFiles};

    case EDIT_FILE:
      const fileName = action.data.fileName;
      const dirty = action.data.content !== state.files[fileName];
      return {...state, editFiles: {
        ...state.editFiles,
        [fileName]: {content: action.data.content, dirty}}
      };

    case SET_CODELOADING:
      return {...state, loading: action.loading};

    default:
      return state;
  }
};

export default codeReducer;
export {loadRepo, EDIT_FILE, commitFiles, startApp};
