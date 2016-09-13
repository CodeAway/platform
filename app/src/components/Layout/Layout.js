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
        {/* <div className={styles.headerItem}>
          <Link to="/code">
            Code
          </Link>
        </div>
        <div className={styles.headerItem}>
          <Link to="/docs">
            Help & Docs
          </Link>
        </div> */}
        <div className={styles.headerItem}>
          <a target="_blank" href="https://discourse.imad.hasura.io">Forum &nbsp;<i className="fa fa-comments-o" aria-hidden="true"></i></a>
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
          Introduction to Modern Appliation Development - <a href="http://imad.tech">imad.tech</a>
        </div>
        Made with &hearts; by <a href="https://hasura.io">Hasura</a>
      </div>
      <Loading loading={loading} />
    </div>
  );
};

const mapStateToProps = (state) => {
  return {...state.layout};
};

export default connect(mapStateToProps)(Layout);
