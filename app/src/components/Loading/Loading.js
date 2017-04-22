import React from 'react';

const Loading = ({loading}) => {
  const styles = require('./Loading.scss');

  if (!loading) {
    return (<div></div>);
  }

  return (
    <div className={styles.container}>
      <div className={styles.loading}>
        <i className="fa fa-cog fa-spin fa-3x fa-fw"></i>
        <span className="sr-only">Loading...</span>
      </div>
    </div>);
};

export default Loading;
