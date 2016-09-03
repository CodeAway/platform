import {combineReducers} from 'redux';
import {routerReducer} from 'react-router-redux'; // eslint-disable-line no-unused-vars
import userReducer from './components/User/Actions';
import projectReducer from './components/Home/ProjectActions';
import codeReducer from './components/Code/Actions';
import layoutReducer from './components/Layout/Actions';

const reducer = combineReducers({
  routing: routerReducer,
  user: userReducer,
  project: projectReducer,
  code: codeReducer,
  layout: layoutReducer
});

export default reducer;
