import React from 'react';
import Helmet from 'react-helmet';
import {connect} from 'react-redux';
import {createProject, createDB, createSSH} from './ProjectActions'; // eslint-disable-line no-unused-vars
import {Link} from 'react-router';

const Home = ({dispatch, project, user}) => {
  const styles = require('./Home.scss');
  const styles2 = require('../Layout/Layout.scss');
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
  } else {
    if (project.pleaseWait) {
      projectStatus = (
        <div className="alert alert-warning" role="alert">
          Please wait for up to 5 minutes for your project files to get ready.
          (Clicking on your console link may not work for 5mins!)
        </div>);
    }
  }

  let dbStatus = null;
  if (!user.table.db_pass) {
    if (project.db.create.status === 'ongoing') {
      dbStatus = (
        <div className="alert alert-warning" role="alert">
          Creating db credentials...
        </div>);
    } else if (project.db.create.status === 'error') {
      dbStatus = (
        <div className="alert alert-error" role="alert">
          Error in creating db. Please contact support immediately and mention the error message below.<br/>
          Error: {JSON.stringify(project.db.create.error)}
        </div>);
    }
  }

  let dbCreds = null;
  if (user.table.db_pass && user.table.db_pass.trim() !== '') {
    dbCreds = (
      <div>
        <table className="table table-responsive">
          <tbody>
            <tr>
              <td>System</td>
              <td>PostgreSQL</td>
            </tr>
            <tr>
              <td>Server</td>
              <td>localhost:5432</td>
            </tr>
            <tr>
              <td>Username</td>
              <td>{user.table.username}</td>
            </tr>
            <tr>
              <td>Password</td>
              <td>{user.table.db_pass}</td>
            </tr>
            <tr>
              <td>Database</td>
              <td>{user.table.username}</td>
            </tr>
          </tbody>
        </table>
      </div>);
  }

  let sshCreds = null;
  if (user.table.ssh_pass && user.table.ssh_pass.trim() !== '') {
    sshCreds = (
      <div>
        <table className="table table-responsive">
          <tbody>
            <tr>
              <td>username@hostname</td>
              <td>{user.table.username}@ssh.imad.hasura-app.io</td>
            </tr>
            <tr>
              <td>password</td>
              <td>{user.table.ssh_pass}</td>
            </tr>
          </tbody>
        </table>
      </div>);
  }

  let sshStatus = null;
  if (!user.table.ssh_pass) {
    if (project.ssh.create.status === 'ongoing') {
      sshStatus = (
        <div className="alert alert-warning" role="alert">
          Creating SSH credentials...
        </div>);
    } else if (project.ssh.create.status === 'error') {
      sshStatus = (
        <div className="alert alert-error" role="alert">
          Error in creating SSH credentials. Please contact support immediately and mention the error message below.<br/>
          Error: {JSON.stringify(project.ssh.create.error)}
        </div>);
    }
  }

  const sshGoTo = (
    <span>
      Go to your <a target="_blank"
        href={`chrome-extension://pnhechapfaindjhompbnflcldabbghjo/html/nassh.html#${user.table.username}@ssh.imad.hasura-app.io`}>
          terminal
        </a>. (Install
        the <a href="https://chrome.google.com/webstore/detail/secure-shell/pnhechapfaindjhompbnflcldabbghjo?hl=en">chrome plugin</a> first!)
    </span>);
  return (
      <div className={styles2.heightContainer}>
        <Helmet title="Home | IMAD console" />

        <div className={styles.leftImg + ' hidden-xs hidden-sm'}>
          <img src={madi} className="img img-responsive" />
        </div>

        <div className={styles.rightCol}>
          <div className={styles.card + ' '}>
            <div className="">
              <h4>My webapp</h4>
              <p>
                {projectStatus}
                {user.table.github_project ?
                  (<span>Go to your <Link to="/code">code console</Link>.</span>) :
                  (<button disabled="disabled" className="btn btn-success" onClick={() => {
                    // dispatch(createProject());
                  }}>
                    Create project
                  </button>)}
              </p>
            </div>
          </div>

          <div className={styles.card + ' '}>
            <div className="">
              <h4>My database</h4>
              <p>
                {dbStatus}
                {(user.table.db_pass && user.table.db_pass.trim() !== '') ?
                  (<div>
                     {dbCreds}
                     <span>Go to your <a target="_blank" href="http://imad-dev-ssh.hasura-app.io/database.php?pgsql=localhost%3A5432">database console.</a></span>
                  </div>) :
                  (<button disabled="disabled" className="btn btn-success" onClick={() => {
                    // dispatch(createDB());
                  }}>
                    Create database credentials
                  </button>)}
              </p>
            </div>
          </div>

          <div className={styles.card + ' '}>
            <div className="">
              <h4>My server</h4>
              <p>
                {sshStatus}
                {user.table.ssh_pass ?
                  (<div>
                     {sshCreds}
                     {sshGoTo}
                  </div>) :
                  (<button className="btn btn-success" onClick={() => (dispatch(createSSH()))}>
                    Create server login credentials
                  </button>)}
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
    user: state.user
  };
};

export default connect(mapStateToProps)(Home);
