import React from 'react';
import {connect} from 'react-redux';
import {logout} from './Actions';
import {Link} from 'react-router';

const Layout = ({logoutRequest, dispatch, children}) => {
  const styles = require('./Layout.scss');
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerItem}>
          <Link to="/home">
            Home
          </Link>
        </div>
        <div className={styles.headerItem}>
          <Link to="/code">
            Code
          </Link>
        </div>
        <div className={styles.headerItem}>
          <Link to="/docs">
            Help
          </Link>
        </div>
        <div className={styles.headerItem}>
          <a target="_blank" href="https://slack.hasura.io">Forum &nbsp;<i className="fa fa-comments-o" aria-hidden="true"></i></a>
        </div>
        <div className={styles.headerItem}>
          <span onClick={(e) => {
            e.preventDefault();
            dispatch(logout());
          }}>
            {logoutRequest ? 'Logging out...' : 'Logout'}
            &nbsp;
            <i className="fa fa-sign-out"></i>
          </span>&nbsp;
        </div>

      </div>
      {children}
    </div>
  );
};

export default connect()(Layout);
