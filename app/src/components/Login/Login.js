import React from 'react';
import Helmet from 'react-helmet';
import Endpoints from 'Endpoints';

const Login = () => {
  const styles = require('./Login.scss');
  const styles2 = require('../Layout/Layout.scss');
  return (
    <div>
      <div className={styles.container}>
        <Helmet title="Login | IMAD console" />
        <div className={styles.centerBox}>
          <a className="btn btn-lg btn-primary" href={'https://github.com/login/oauth/authorize?client_id=bcaac3b822c108523d5b&scope=user%20public_repo&redirect_uri=' + Endpoints.ghRedirect} role="button">
            <span className={styles.icon}><i className="fa fa-github" /></span>
            Sign in with github
          </a>
        </div>
      </div>
      <div className={styles2.footer}>
        <div className={styles2.course}>
          Introduction to Modern Appliation Development - <a href="http://imad.tech">imad.tech</a>
        </div>
        Made with &hearts; by <a href="https://hasura.io">Hasura</a>
      </div>
    </div>
  );
};

export default Login;
