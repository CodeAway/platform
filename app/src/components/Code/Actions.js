import defaultState from './State';
import requestAction from 'utils/requestAction';

import Globals from 'Globals';

const SET_TREE = 'Code/SET_TREE';
const SET_BASEFILE = 'Code/SET_BASEFILE';
const INITIALISED = 'Code/INITIALISED';

const loadRepo = () => {
  return (dispatch, getState) => {
    const user = getState().user;
    const treeUrl = `https://api.github.com/repos/coco98/${Globals.repoName}/git/trees/master?recursive=1`;
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
          const baseFiles = ['src/server.js', 'src/ui/index.html', 'src/ui/style.css', 'src/ui/main.js'];
          // const baseFiles = ['server.js', 'ui/index.html', 'ui/style.css', 'ui/main.js'];
          const blobs = {};
          treeData.tree.map(f => {
            if (baseFiles.indexOf(f.path) > -1) {
              blobs[f.path] = f.url;
            }
          });

          if (Object.keys(blobs).length !== baseFiles.length) {
            console.error(blobs);
            alert('Could not find one of (server.js, index.html, style.css, main.js) in the repo. Please contact support for help.');
            reject();
            return;
          }

          Promise.all(baseFiles.map(f => {
            return dispatch(requestAction(blobs[f], options)).then(data => {
              dispatch({type: SET_BASEFILE, data: {name: f, contents: window.atob(data.content)}});
            });
          })).then(
            () => {
              dispatch({type: INITIALISED});
              resolve();
            },
            (error) => {
              alert(`Could not fetch a file from github. Please try refreshing the page, or contact support if the problem persists.\n
                Error: ${JSON.stringify(error)}`);
              reject();
            });
        },
        () => {
          alert('Could not fetch files from github. Try again or contact support if this problem persists');
          reject();
        }
      );
    });
  };
};

const codeReducer = (state = defaultState, action) => {
  switch (action.type) {
    case SET_TREE:
      return {...state, gitTree: action.data};
    case SET_BASEFILE:
      const baseFiles = state.baseFiles ? state.baseFiles : {};
      return {...state, baseFiles: {...baseFiles, [action.data.name]: action.data.contents}};
    case INITIALISED:
      return {...state, status: 'loaded'};
    default:
      return state;
  }
};

export default codeReducer;
export {loadRepo};
