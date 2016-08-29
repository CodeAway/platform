import React from 'react';
import {connect} from 'react-redux';

const Home = () => {
  const styles = require('./Home.scss');
  return (
      <h1 className={styles.test}>Home</h1>
  );
};

export default connect()(Home);
