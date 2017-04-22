import React from 'react';
import {connect} from 'react-redux';

const Layout = ({children}) => {
  const styles = require('./Layout.scss');
  return (
    <div className={styles.container}>
      {children}
    </div>
  );
};

export default connect()(Layout);
