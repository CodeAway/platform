import React from 'react';
import Helmet from 'react-helmet';
import {connect} from 'react-redux';
import {registerEmail} from '../User/Actions';

const Email = ({dispatch, email}) => {
  const styles = require('./Email.scss');
  const styles2 = require('../Layout/Layout.scss');
  let emailInput;
  let alertTxt = null;
  let btnText = 'Register';
  if (email) {
    if (email.ongoing) {
      btnText = 'Submitting...';
    } else if (email.error) {
      alertTxt = (<div className="alert alert-danger" role="alert">{email.error}</div>);
    }
  }
  return (
    <div>
      <div className={styles.container}>
        <Helmet title="Register email | CodeAway console" />
        <div className={styles.centerBox}>
          <form onSubmit={(e) => {
            e.preventDefault();
            dispatch(registerEmail(emailInput.value));
          }}>
            {alertTxt}
            <div className="form-group">
              <label htmlFor="inputEmail">Your email address:</label>
              <input ref={(n) => (emailInput = n)} type="email" className="form-control" id="inputEmail" placeholder="Email" />
            </div>
            <input type="submit" className="btn btn-primary" role="button" value={btnText} />
          </form>
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

const mapStateToProps = (state) => {
  return {...state.user};
};

export default connect(mapStateToProps)(Email);
