import React from 'react';
import Helmet from 'react-helmet';

const Docs = () => {
  const styles2 = require('../Layout/Layout.scss');
  return (
    <div className={styles2.heightContainer}>
      <Helmet title="Help & Docs | CodeAway console" />
      <div>
        <h2>Documentation & Tutorials (coming soon)</h2>
        <div>
          <i>Coming soon</i>
            <ul>
              <li>VIDEO: How to create a new project</li>
              <li>VIDEO: How to save code to github</li>
              <li>VIDEO: How to deploy your webapp</li>
            </ul>
        </div>
      </div>
    </div>
  );
};

export default Docs;
