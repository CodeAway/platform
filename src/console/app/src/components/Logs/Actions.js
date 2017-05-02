import defaultState from './State';
import requestAction from 'utils/requestAction';
import Endpoints, {globalCookiePolicy} from 'Endpoints';

const SET_LOGS = 'Logs/SET_LOGS';
const SET_POLLER = 'Logs/SET_POLLER';
const REMOVE_POLLER = 'Logs/REMOVE_POLLER';

const startLogging = () => {
  return (dispatch) => {
    const intervalId = setInterval(() => {
      const url = Endpoints.apiUrl + '/logs';
      const options = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: globalCookiePolicy
      };
      dispatch(requestAction(url, options, SET_LOGS));
    }, 2000);

    dispatch({type: SET_POLLER, data: intervalId});
  };
};

const stopLogging = () => {
  return (dispatch, getState) => {
    const poller = getState().logs.poller;
    clearInterval(poller);
    dispatch({type: REMOVE_POLLER});
  };
};

const logReducer = (state = defaultState, action) => {
  switch (action.type) {
    case SET_LOGS:
      return {...state, logLines: action.data.data};
    case SET_POLLER:
      return {...state, poller: action.data};
    case REMOVE_POLLER:
      return {...state, poller: null};

    default:
      return state;
  }
};

export default logReducer;
export {startLogging, stopLogging, SET_LOGS};
