import {combineReducers} from 'redux';
import {routerReducer} from 'react-router-redux'; // eslint-disable-line no-unused-vars
import fileReducer from './components/Files/Actions';
import userReducer from './components/User/Actions';
import projectReducer from './components/Home/ProjectActions';

const reducer = combineReducers({
  routing: routerReducer,
  files: fileReducer,
  user: userReducer,
  project: projectReducer
});

export default reducer;
