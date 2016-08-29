import {combineReducers} from 'redux';
import {routerReducer} from 'react-router-redux'; // eslint-disable-line no-unused-vars
import fileReducer from './components/Files/Actions';

const reducer = combineReducers({
  routing: routerReducer,
  files: fileReducer
});

export default reducer;
