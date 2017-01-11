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
        <Helmet title="Register email | IMAD console" />
        <div className={styles.centerBox}>
          <form onSubmit={(e) => {
            e.preventDefault();
            dispatch(registerEmail(emailInput.value));
          }}>
            {alertTxt}
            <div className="form-group">
              <label htmlFor="inputEmail">Your NPTEL registered email address:</label>
              <input ref={(n) => (emailInput = n)} type="email" className="form-control" id="inputEmail" placeholder="Email" />
            </div>
            <input type="submit" className="btn btn-primary" role="button" value={btnText} />
          </form>
        </div>
      </div>
      <div className={styles2.footer}>
        <div className={styles2.course}>
          Introduction to Modern Application Development - <a href="http://imad.tech">imad.tech</a>
        </div>
        Made with &hearts; by <a href="https://hasura.io">Hasura</a>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {...state.user};
};

export default connect(mapStateToProps)(Email);
