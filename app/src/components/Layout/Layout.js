import React from 'react';
import {connect} from 'react-redux';
import {logout} from './Actions';
import {Link} from 'react-router';

const Layout = ({logoutRequest, dispatch, children}) => {
  const styles = require('./Layout.scss');
  const madi = require('./madi.png');
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <Link to="/home">
            <img className="img img-responsive" src={madi} />
          </Link>
        </div>

        <div className={styles.headerItem}>
          <Link to="/code">
            <a target="_blank" href="https://github.com/hasura/support/issues">Code</a>
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
