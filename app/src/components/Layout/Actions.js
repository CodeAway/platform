import defaultState from './State';
import Endpoints, {globalCookiePolicy} from 'Endpoints';
import {push} from 'react-router-redux';
import requestAction from 'utils/requestAction';

const LOGOUT_REQUEST = 'Layout/LOGOUT_REQUEST';
const LOGOUT_SUCCESS = 'Layout/LOGOUT_SUCCESS';
const LOADING_ON = 'Layout/LOADING_ON';
const LOADING_OFF = 'Layout/LOADING_OFF';

const logout = () => {
  return (dispatch) => {
    dispatch({type: LOGOUT_REQUEST});
    const url = Endpoints.authUrl + '/user/logout';
    const options = {
      method: 'GET',
      credentials: globalCookiePolicy
    };

    return dispatch(requestAction(url, options, LOGOUT_SUCCESS)).then(
      () => (dispatch(push('/login'))));
  };
};

const loadingOn = () => ({type: LOADING_ON});
const loadingOff = () => ({type: LOADING_OFF});

const layoutReducer = (state = defaultState, action) => {
  switch (action.type) {
    case LOGOUT_SUCCESS:
      return {...state, logoutRequest: false};
    case LOGOUT_REQUEST:
      return {...state, logoutRequest: true};
    case LOADING_ON:
      return {...state, loading: true};
    case LOADING_OFF:
      return {...state, loading: false};
    default:
      return state;
  }
};

export default layoutReducer;
export {logout, loadingOn, loadingOff};
