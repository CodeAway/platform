import React from 'react';
import Helmet from 'react-helmet';
import {connect} from 'react-redux';
import {createProject} from './ProjectActions';
import {Link} from 'react-router';

const Home = ({dispatch, project, user}) => {
  const styles = require('./Home.scss');
  const madi = require('./madi.png');

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
        <hr/>
        <div className={styles.container}>
          <Helmet title="Home | IMAD console" />

          <div className={styles.leftImg + ' hidden-xs hidden-sm'}>
            <img src={madi} className="img img-responsive" />
          </div>

          <div className={styles.rightCol}>
            <div className={styles.card + ' row'}>
              <div className="col-xs-12">
                <h4>My webapp</h4>
                <p>
                  {projectStatus}
                  {user.table.github_project ?
                    (<span>Go to your code <Link to="/code">console</Link></span>) :
                    (<button className="btn btn-success" onClick={() => (dispatch(createProject()))}>
                      Create project
                    </button>)}
                </p>
              </div>
            </div>

            <div className={styles.card + ' row'}>
              <div className="col-xs-12">
                <h4>My database</h4>
                <p>
                  {user.table.github_project ?
                    (<span>Go to your code <Link to="/code">console</Link></span>) :
                    (<button className="btn btn-success" onClick={() => (dispatch(createProject()))}>
                      Create database credentials
                    </button>)}
                </p>
              </div>
            </div>

            <div className={styles.card + ' row'}>
              <div className="col-xs-12">
                <h4>My server</h4>
                <p>
                  {user.table.github_project ?
                    (<span>Go to your <a href="https://chrome.google.com/webstore/detail/secure-shell/pnhechapfaindjhompbnflcldabbghjo?hl=en">terminal</a></span>) :
                    (<button className="btn btn-success" onClick={() => (dispatch(createProject()))}>
                      Create server login credentials
                    </button>)}
                </p>
              </div>
            </div>
          </div>

        </div>
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
