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
const SET_INVALID_FILES = 'Code/SET_INVALID_FILES';
const SET_LATEST_COMMIT = 'Code/SET_LATEST_COMMIT';

const isValid = (path) => {
  if (path.endsWith('.js') || path.endsWith('.css') || path.endsWith('.html')) {
    return true;
  }
  return true;
};

const githubUsername = (username) => {
  let ghUsername = '';
  if (username.startsWith('user-')) {
    ghUsername = username.split('user-')[1];
  } else {
    ghUsername = username;
  }
  return ghUsername;
};

const loadRepo = () => {
  return (dispatch, getState) => {
    dispatch(loadingOn());
    const state = getState();
    const user = state.user;
    const project = state.projects.current;
    const treeUrl = project.project.trees_url.split('{')[0] + '/master?recursive=1';
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
          // const baseFiles = ['server.js', 'ui/index.html', 'ui/style.css', 'ui/main.js'];

          // const baseFiles = ['server.js', 'ui/index.html', 'ui/style.css', 'ui/main.js'];
          const blobs = {};
          const invalidFiles = [];
          treeData.tree.map(f => {
            if (f.type === 'blob') {
              if (isValid(f.path)) {
                blobs[f.path] = f.url;
              } else {
                invalidFiles.push(f.path);
              }
            }
          });

          // Check for all base files
          // let noBaseFiles = 0;
          const allFiles = Object.keys(blobs);
          // baseFiles.map(f => {
          //   if (allFiles.indexOf(f) > -1 ) {
          //     noBaseFiles += 1;
          //   }
          // });
          // if (noBaseFiles !== 4) {
          //   alert('Could not find one of (server.js, index.html, style.css, main.js) in the repo. Please contact support for help.');
          //   dispatch(loadingOff());
          //   reject();
          //   return;
          // }

          // // Set all the invalid non-editable files
          // dispatch({type: SET_INVALID_FILES, data: invalidFiles});

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

const startApp = () => {
  return (dispatch, getState) => {
    dispatch({type: SET_CODELOADING, loading: true});
    // Create the configmap & make an API request
    const state = getState().code;
    // const user = getState().user;

    const url = Endpoints.apiUrl + '/restart'; // + user.table.username;
    const options = {
      method: 'POST',
      body: JSON.stringify({
        gitRevision: state.latestCommit,
        gitUrl: getState().user.table.github_project.clone_url
      }),
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

const commitFilesAndRestart = () => {
  return (dispatch, getState) => {
    dispatch({type: SET_CODELOADING, loading: true});

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
    let totalDone = 0;
    const success = (f, resolve) => {
      return (data) => {
        // Also set the latest commit
        dispatch({type: SET_LATEST_COMMIT, data: data.commit.sha});
        dispatch({type: SET_FILE, data: {name: f, content: newFiles[f], sha: data.content.sha}});
        dispatch({type: EDIT_FILE, data: {fileName: f, content: newFiles[f]}});
        resolve();
        totalDone += 1;
        if (totalDone === Object.keys(newFiles).length) {
          dispatch({type: SET_CODELOADING, loading: false});
        }
      };
    };
    const abort = (f, reject) => {
      return () => {
        dispatch({type: SET_CODELOADING, loading: false});
        alert('Commit failed for: ' + f + '. Please try again or contact support if this persists.');
        reject();
      };
    };

    // Fetch vars
    const updateUrl = (file) => (`https://api.github.com/repos/${githubUsername(user.table.username)}/${Globals.repoName}/contents/${encodeURIComponent(file)}`);
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

    if (Object.keys(newFiles).length === 0) {
      dispatch(startApp());
      return;
    }

    // If new files are present then create a promise (haha) to commit all files
    return Promise.all(Object.keys(newFiles).map((f, i) => {  // eslint-disable-line consistent-return
      return new Promise((resolve, reject) => {
        setTimeout(
          () => {
            dispatch(requestAction(updateUrl(f), options(f))).then(success(f, resolve), abort(f, reject));
          }, i * 500);
      });
    })).then(
      () => {
        dispatch(startApp());
      },
      (error) => {
        console.error(error);
        alert('Failed to commit files. Please try to commit again, or refresh this page to fetch the latest committed files and abandon changes');
      }
    );
  };
};

// /////////////////////////////////////////////////////////////

const codeReducer = (state = defaultState, action) => {
  switch (action.type) {
    case SET_LATEST_COMMIT:
      return {...state, latestCommit: action.data};

    case SET_TREE:
      return {...state, gitTree: action.data, latestCommit: action.data.sha};
    case SET_FILE:
      const files = state.files ? state.files : {};
      const shas = state.shas ? state.shas : {};
      return {...state,
        files: {...files, [action.data.name]: action.data.content},
        shas: {...shas, [action.data.name]: action.data.sha},
      };

    case SET_INVALID_FILES:
      return {...state, invalidFiles: action.data};

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
export {loadRepo, EDIT_FILE, commitFilesAndRestart};
