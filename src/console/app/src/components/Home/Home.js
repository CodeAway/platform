import React from 'react';
import Helmet from 'react-helmet';
import {connect} from 'react-redux';
import {createProject} from './ProjectActions';
import {Link} from 'react-router';

const Home = ({dispatch, project, projects, user}) => {
  const styles = require('./Home.scss');
  const styles2 = require('../Layout/Layout.scss');
  const madi = require('./madi.png');
  const projectItems = projects.list.map((proj) =>
    <li key={proj.id}>{proj.name}</li>
  );
  const projectsList = (
    <div>
      <ul>{projectItems}</ul>
    </div>
  );

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
  } else {
    if (project.pleaseWait) {
      projectStatus = (
        <div className="alert alert-warning" role="alert">
          Please wait for up to 5 minutes for your project files to get ready.
          (Clicking on your console link may not work for 5mins!)
        </div>);
    }
  }

  return (
      <div className={styles2.heightContainer}>
        <Helmet title="Home | IMAD console" />

        <div className={styles.leftImg + ' hidden-xs hidden-sm'}>
          <img src={madi} className="img img-responsive" />
        </div>

        <div className={styles.rightCol}>
          <div className={styles.card + ' '}>
            <div className="">
              {projectStatus}

              <button className="btn btn-success" onClick={() => {
                dispatch(createProject());
              }}>
                Create a new project
              </button>
              <h4>Your projects</h4>
              {projectsList}
              <p>
                <span>Go to your <Link to="/code">code console</Link>.</span>

              </p>
            </div>
          </div>

        </div>
      </div>
  );
};

const mapStateToProps = (state) => {
  return {
    project: state.project,
    projects: state.projects,
    user: state.user
  };
};

export default connect(mapStateToProps)(Home);
