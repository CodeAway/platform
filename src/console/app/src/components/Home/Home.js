import React from 'react';
import Helmet from 'react-helmet';
import {connect} from 'react-redux';
import {createProject, SET_NEW_ENV_ID} from '../Projects/Actions';
import {Link} from 'react-router';

const Home = ({dispatch, projects, user}) => {
  const styles = require('./Home.scss');
  const styles2 = require('../Layout/Layout.scss');
  const madi = require('./madi.png');

  const projectItems = projects.list.map((proj) =>
    <li key={proj.id}><Link to={`/code/${proj.id}`}>{proj.name}</Link></li>
  );
  const projectsList = (
    <div>
      <ul>{projectItems}</ul>
    </div>
  );

  let projectStatus = null;
  if ( !user.table.github_project) {
    if (projects.create.status === 'ongoing') {
      projectStatus = (
        <div className="alert alert-warning" role="alert">
          Creating project...
        </div>);
    } else if (projects.create.status === 'error') {
      projectStatus = (
        <div className="alert alert-error" role="alert">
          Error in creating project. Please contact support immediately and mention the error message below.<br/>
          Error: {JSON.stringify(projects.create.error)}
        </div>);
    }
  } else {
    if (projects.pleaseWait) {
      projectStatus = (
        <div className="alert alert-warning" role="alert">
          Please wait for up to 5 minutes for your project files to get ready.
          (Clicking on your console link may not work for 5mins!)
        </div>);
    }
  }

  const environments = projects.environments.map( (env) =>
    <option key={env.id} value={env.id}>{env.name}</option>
  );

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
              <h4>Create a new project</h4>
              <div className="row">
                <div className="col-md-8">
                <select className="form-control" onChange={
                    (e)=>{
                      e.preventDefault();
                      dispatch({type: SET_NEW_ENV_ID, data: parseInt(e.target.value, 10)});
                    }
                  }>
                  <option key="0" value="0">--- Select an environment ---</option>
                  {environments}
                </select>
                </div>
                <div className="col-md-4">
                <button className="btn btn-success" onClick={() => {
                  dispatch(createProject());
                }}>
                  Create
                </button>
                </div>
              </div>
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
    projects: state.projects,
    user: state.user
  };
};

export default connect(mapStateToProps)(Home);
