import React from 'react';
import Helmet from 'react-helmet';
import Endpoints from 'Endpoints';
import Globals from 'Globals';

const Login = () => {
  const styles = require('./Login.scss');
  const styles2 = require('../Layout/Layout.scss');
  return (
    <div>
      <div className={styles.container}>
        <Helmet title="Login | CodeAway console" />
        <div className={styles.centerBox}>
          <a className="btn btn-lg btn-primary" href={'https://github.com/login/oauth/authorize?client_id=' + Globals.githubClientID + '&scope=user%20public_repo&redirect_uri=' + Endpoints.ghRedirect} role="button">
            <span className={styles.icon}><i className="fa fa-github" /></span>
            Sign in with github
          </a>
        </div>
      </div>
      <div className={styles2.footer}>
        <div className={styles2.course}>
          <a href="https://github.com/CodeAway">CodeAway Platform</a>
        </div>
        Made with &hearts; by <a href="https://github.com/shahidhk">shahidhk</a> &amp; <a href="https://github.com/coco98">coco98</a>
      </div>
    </div>
  );
};

export default Login;
