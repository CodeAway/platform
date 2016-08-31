import {combineReducers} from 'redux';
import {routerReducer} from 'react-router-redux'; // eslint-disable-line no-unused-vars
import fileReducer from './components/Files/Actions';
import userReducer from './components/User/Actions';
import projectReducer from './components/Home/ProjectActions';
import codeReducer from './components/Code/Actions';

const reducer = combineReducers({
  routing: routerReducer,
  files: fileReducer,
  user: userReducer,
  project: projectReducer,
  code: codeReducer
});

export default reducer;
