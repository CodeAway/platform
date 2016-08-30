import React from 'react';
import Helmet from 'react-helmet';

const Login = () => {
  const styles = require('./Login.scss');
  return (
    <div className={styles.container + ' container'}>
      <Helmet title="Login | IMAD console" />
      <div className={styles.centerBox}>
        <a className="btn btn-lg btn-default" href="https://github.com/login/oauth/authorize?client_id=bcaac3b822c108523d5b&redirect_uri=http://auth.imad-stg.hasura-app.io/github/authenticate&scope=user%20repo" role="button">
          <span className={styles.icon}><i className="fa fa-github" /></span>
          Sign in with github
        </a>
      </div>
    </div>
  );
};

export default Login;
