import React from 'react';
import Helmet from 'react-helmet';
import {connect} from 'react-redux';
import {createProject} from './ProjectActions';

const Home = ({dispatch, project, user}) => {
  // const styles = require('./Home.scss');
  let projectStatus = null;
  if (!user.table.github_project) {
    if (project.create.status === 'ongoing') {
      projectStatus = (
        <div className="alert alert-warning" role="alert">
          Creating project...
        </div>);
    } else if (project.create.status === 'error') {
      projectStatus = (
        <div className="alert alert-error" role="alert">
          Error in creating project. Please contact support immediately and mention the error message below.<br/>
          Error: {JSON.stringify(project.create.error)}
        </div>);
    }
  }

  return (
      <div className="container">
        <Helmet title="Home | IMAD console" />
        <br/><br/>
        {projectStatus}
        {user.table.github_project ? null :
          (<button className="btn btn-success" onClick={() => (dispatch(createProject()))}>
            Create project
          </button>)}
      </div>
  );
};

const mapStateToProps = (state) => {
  return {
    project: state.project,
    user: state.user
  };
};

export default connect(mapStateToProps)(Home);
