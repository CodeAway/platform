import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import Helmet from 'react-helmet';

const Code = ({children}) => {
  const styles = require('./Code.scss');
  const appPrefix = '';
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
            <li><button className="btn btn-primary" role="button">Save & Restart</button></li>
            <li><button className="btn btn-primary" role="button">Commit to github</button></li>
          </ul>
          <hr/>
          <ul>
            <li>
              Files
              <ul>
                <li className={styles.file}> <Link to={appPrefix + '/code/files/server.js'}> server.js </Link> </li>
                <li className={styles.file}> <Link to={appPrefix + '/code/files/index.html'}> index.html</Link> </li>
                <li className={styles.file}> <Link to={appPrefix + '/code/files/style.css'}> style.css</Link> </li>
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

export default connect()(Code);
