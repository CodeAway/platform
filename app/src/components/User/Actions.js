import Endpoints, {globalCookiePolicy} from 'Endpoints';
import requestAction from 'utils/requestAction';
import {push} from 'react-router-redux';

const SETUSER = 'User/SETUSER';
const SETAUTH = 'User/SETAUTH';
const SET_USERPROJECT = 'User/SET_USERPROJECT';
const SET_DBPASS = 'User/SET_DBPASS';
const SET_SSHPASS = 'User/SET_SSHPASS';
const EMAIL_REQUEST = 'User/EMAIL_REQUEST';
const EMAIL_SUCCESS = 'User/EMAIL_SUCCESS';
const EMAIL_ERROR = 'User/EMAIL_ERROR';

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

const registerEmail = (email) => {
  return (dispatch, getState) => {
    dispatch({type: EMAIL_REQUEST});
    const url = Endpoints.dataUrl + '/api/1/table/user/update';
    const options = {
      ...defaultOptions,
      method: 'POST',
      body: JSON.stringify({
        $set: {email},
        where: {hasura_id: getState().user.table.hasura_id}
      })
    };

    fetch(url, options).then(
      (response) => {
        if (response.ok) {
          response.json().then((data) => {
            if (data.affected_rows === 1) {
              dispatch({type: EMAIL_SUCCESS, data: email});
              dispatch(push('/home'));
            } else {
              dispatch({type: EMAIL_ERROR, data: 'Something went wrong! Please try again or contact support with this message: email update on no rows'});
            }
          });
        } else if (response.status === 400) {
          response.json().then(error => {
            if (error.error.indexOf('user_email_fkey') > 0) {
              // Check if error is foreign-key violation, because then email does not exist
              dispatch({type: EMAIL_ERROR, data: 'This email has not been registered with NPTEL. Please try again, or contact support.'});
            } else if (error.error.indexOf('user_email_unique') > 0) {
              // Check if error is uniqueness violation, because then email is already registered
              dispatch({type: EMAIL_ERROR, data: 'This email has already been registered! Please try again or contact support.'});
            } else {
              console.error(JSON.stringify(error));
              dispatch({type: EMAIL_ERROR, data: 'Something went wrong! Please try again or contact support with this message: ' + JSON.stringify(error)});
            }
          });
        } else {
          response.text().then(t => {
            console.error(t);
            dispatch({type: EMAIL_ERROR, data: 'Something went wrong! Please try again or contact support with this message: ' + t});
          });
        }
      },
      (error) => {
        console.error(error);
        dispatch({type: EMAIL_ERROR, data: 'Could not connect to the server'});
      });
  };
};

const userReducer = (state = {}, action) => {
  switch (action.type) {
    case SETAUTH:
      return {...state, auth: {...action.data}};
    case SETUSER:
      return {...state, table: {...action.data}};

    case SET_USERPROJECT:
      return {...state, table: {...state.table, github_project: action.data}};

    case SET_DBPASS:
      return {...state, table: {...state.table, db_pass: action.data}};
    case SET_SSHPASS:
      return {...state, table: {...state.table, ssh_pass: action.data}};

    case EMAIL_REQUEST:
      return {...state, email: {ongoing: true, error: null}};
    case EMAIL_SUCCESS:
      return {...state, table: {...state.table, email: action.data}, email: {ongoing: false, error: null}};
    case EMAIL_ERROR:
      return {...state, email: {ongoing: false, error: action.data}};
    default:
      return state;
  }
};

export default userReducer;
export {loadUser, SET_USERPROJECT, SET_SSHPASS, SET_DBPASS, registerEmail};
