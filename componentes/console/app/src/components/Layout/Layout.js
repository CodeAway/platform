import React from 'react';
import {connect} from 'react-redux';
import {logout} from './Actions';
import {Link} from 'react-router';
import Loading from '../Loading/Loading';

const Layout = ({logoutRequest, loading, dispatch, children}) => {
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
          <a href="" onClick={(e) => (e.preventDefault())}>
            <span onClick={(e) => {
              e.preventDefault();
              dispatch(logout());
            }}>
              {logoutRequest ? 'Logging out...' : 'Logout'}
              &nbsp;
              <i className="fa fa-sign-out"></i>
            </span>
          </a>
        </div>

      </div>
      <div className="container">
        <hr className={styles.noTop}/>
        {children}
      </div>
      <div className={styles.footer}>
        <div className={styles.course}>
          <a href="https://github.com/CodeAway">CodeAway Platform</a>
        </div>
        Made with &hearts; by <a href="https://github.com/shahidhk">shahidhk</a> &amp; <a href="https://github.com/coco98">coco98</a>
      </div>
      <Loading loading={loading} />
    </div>
  );
};

const mapStateToProps = (state) => {
  return {...state.layout};
};

export default connect(mapStateToProps)(Layout);
