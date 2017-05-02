import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import Helmet from 'react-helmet';
import {commitFilesAndRestart} from './Actions';
import Loading from '../Loading/Loading';

const Code = ({files, invalidFiles, children, dispatch, editFiles, user, loading, project}) => {
  const styles = require('./Code.scss');
  const appPrefix = '';
  const fileList = [];
  const fileNames = Object.keys(files).sort();
  if (files) {
    fileNames.map((f, i) => {
      fileList.push((<li className={styles.file}>
        <Link key={i} to={appPrefix + '/code/' + project.id + '/files/' + encodeURIComponent(f)}> {f}{editFiles[f].dirty ? '*' : ''} </Link>
      </li>));
    });
  } else {
    fileList.push((<li key={0} className={styles.file}> <i>Loading...</i></li>));
  }

  let invalidFileList;
  if (invalidFiles && invalidFiles.length) {
    invalidFileList = invalidFiles.map(f => {
      return (
        <li>
          {f}
        </li>);
    });
  }
  const anyDirty = fileNames.some(f => (editFiles[f].dirty));
  let goToAppLink = null;
  let logsLink = (<li><Link to={`${appPrefix}/code/${project.id}/logs`}>Output</Link></li>);
  if (project.environment.is_server) {
    goToAppLink = (<li><a href={`http://${user.table.username}.imad.hasura-app.io`} target="_blank">Go to app</a></li>);
    logsLink = (<li><a href={`${appPrefix}/code/${project.id}/logs`} target="_blank">Logs</a></li>);
  }

  return (
      <div className={styles.container}>
        <Helmet title="Code | IMAD console" />
        <div className={styles.sidebar}>
          <div className={styles.title}>
            <h4>
              <i title="Code" className="fa fa-code" aria-hidden="true"></i> &nbsp; <Link to="/home"><u>Home</u></Link> / <Link to={`/code/${project.id}/home`}>Code</Link>
            </h4>
          </div>
          <hr/>
          <ul>
            {logsLink}
            {goToAppLink}
          </ul>
          <hr/>
          <ul>
            <li><button className="btn btn-primary" role="button" onClick={() => {
              dispatch(commitFilesAndRestart());
            }}>{anyDirty ? 'Save & Run' : 'Run'}</button></li>
          </ul>
          <hr/>
          <ul>
            <li>
              Files
              <ul>
                {fileList}
              </ul>
            </li>
          </ul>
          <hr/>
          <ul>
            <li>
              Other files (edit/upload on <a href={project.project.html_url} target="_blank">github <i className="fa fa-external-link"></i></a>)
              <ul>
                {invalidFileList}
              </ul>
            </li>
          </ul>
        </div>
        <div className={styles.main}>
          {children}
        </div>
        <Loading loading={loading} />
      </div>
  );
};
const mapStateToProps = (state) => {
  return {
    ...state.code,
    user: state.user,
    project: state.projects.current,
  };
};

export default connect(mapStateToProps)(Code);
