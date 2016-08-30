import Endpoints, {globalCookiePolicy} from 'Endpoints';
import requestAction from 'utils/requestAction';

const SETUSER = 'User/SETUSER';
const SETAUTH = 'User/SETAUTH';

const defaultOptions = {
  credentials: globalCookiePolicy,
  headers: {'Content-Type': 'application/json'}
};

const loadAuth = () => {
  return (dispatch) => {
    const authInfoUrl = Endpoints.authUrl + '/user/account/info';
    const options = {
      ...defaultOptions,
      method: 'GET'
    };

    return dispatch(requestAction(authInfoUrl, options, SETAUTH));
  };
};

const loadUser = () => {
  return (dispatch, getState) => {
    const userInfoUrl = Endpoints.dataUrl + '/api/1/table/user/select';
    const options = {
      ...defaultOptions,
      method: 'POST',
      body: JSON.stringify({columns: ['*']})
    };

    if (!getState().user || !getState().user.auth) {
      const p = new Promise((resolve, reject) => {
        dispatch(loadAuth()).then(
          () => {
            dispatch(requestAction(userInfoUrl, options)).then(
              (data) => {
                if (data.length) {
                  dispatch({type: SETUSER, data: data[0]});
                  resolve();
                } else {
                  reject();
                }
              },
              () => {
                reject();
              });
          },
          () => {
            reject();
          });
      });

      return p;
    }

    const p = new Promise((resolve, reject) => {
      dispatch(requestAction(userInfoUrl, options)).then(
        (data) => {
          if (data.length) {
            dispatch({type: SETUSER, data: data[0]});
            resolve();
          } else {
            reject();
          }
        },
        () => { reject(); }
      );
    });

    return p;
  };
};

const userReducer = (state = null, action) => {
  switch (action.type) {
    case SETAUTH:
      return {...state, auth: {...action.data}};
    case SETUSER:
      return {...state, table: {...action.data[0]}};
    default:
      return state;
  }
};

export default userReducer;
export {loadUser};
