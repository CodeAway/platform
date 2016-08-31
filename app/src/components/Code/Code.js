import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import Helmet from 'react-helmet';

const Code = ({baseFiles, children}) => {
  const styles = require('./Code.scss');
  const appPrefix = '';
  const fileList = [];
  if (baseFiles) {
    const fileNames = Object.keys(baseFiles).sort();
    fileNames.map(f => {
      fileList.push((<li className={styles.file}>
        <Link to={appPrefix + '/code/files/' + encodeURIComponent(f)}> {f} </Link>
      </li>));
    });
  } else {
    fileList.push((<li className={styles.file}> <i>Loading...</i></li>));
  }
  return (
      <div className={styles.container}>
        <Helmet title="Code | IMAD console" />
        <div className={styles.sidebar}>
          <div className={styles.title}>
            <h4>
              <i title="Code" className="fa fa-code" aria-hidden="true"></i> &nbsp; Code
            </h4>
          </div>
          <hr/>
          <ul>
            <li><Link to={appPrefix + '/code/logs'}>Logs</Link></li>
            <li><a href="https://tanmaig.imad.hasura.io" target="_blank">Go to app</a></li>
          </ul>
          <hr/>
          <ul>
            <li><button className="btn btn-primary" role="button">Apply changes & Restart</button></li>
            <li><button className="btn btn-primary" role="button">Commit to github</button></li>
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
  return {...state.code};
};
export default connect(mapStateToProps)(Code);
