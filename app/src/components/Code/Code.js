import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import Helmet from 'react-helmet';
import {startApp, commitFiles} from './Actions';

const Code = ({files, children, dispatch, editFiles, user}) => {
  const styles = require('./Code.scss');
  const appPrefix = '';
  const fileList = [];
  const fileNames = Object.keys(files).sort();
  if (files) {
    fileNames.map((f, i) => {
      fileList.push((<li className={styles.file}>
        <Link key={i} to={appPrefix + '/code/files/' + encodeURIComponent(f)}> {f}{editFiles[f].dirty ? '*' : ''} </Link>
      </li>));
    });
  } else {
    fileList.push((<li key={0} className={styles.file}> <i>Loading...</i></li>));
  }
  const anyDirty = fileNames.some(f => (editFiles[f].dirty));
  return (
      <div className={styles.container}>
        <Helmet title="Code | IMAD console" />
        <div className={styles.sidebar}>
          <div className={styles.title}>
            <h4>
              <i title="Code" className="fa fa-code" aria-hidden="true"></i> &nbsp; <Link to="/home"><u>Home</u></Link> / <Link to="/code/home">Code</Link>
            </h4>
          </div>
          <hr/>
          <ul>
            <li><Link to={appPrefix + '/code/logs'}>Logs</Link></li>
            <li><a href={`http://${user.table.username}.imad.hasura-app.io`} target="_blank">Go to app</a></li>
          </ul>
          <hr/>
          <ul>
            <li><button className="btn btn-primary" role="button" onClick={() => {
              dispatch(startApp());
            }}>Apply changes & Restart</button></li>
            <li><button className="btn btn-primary" role="button" disabled={anyDirty ? null : 'disabled'} onClick={() => {
              dispatch(commitFiles());
            }}>Commit to github</button></li>
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
        </div>
        <div className={styles.main}>
          {children}
        </div>
      </div>
  );
};
const mapStateToProps = (state) => {
  return {...state.code, user: state.user};
};
export default connect(mapStateToProps)(Code);
