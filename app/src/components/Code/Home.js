import React from 'react';

const Home = () => {
  return (
    <div className="container">
      <h3>Using the console</h3>
      <div className="container">
        <h5>Editing files</h5>
        <p>
          Click on the filename and edit your file
        </p>
        <h5>Changing files and viewing your webapp</h5>
        <p>
          Click on apply changes and then on the go to your app link
        </p>
        <h5>Saving your files to github</h5>
        <p>
          Save to github saves your files to github so that when you refresh this page,
          your changes are not lost.
        </p>
      </div>
      <hr/>
      <h3>How this console works</h3>
      <div className="container">
        <p>
          Infographic thingy
        </p>
      </div>
    </div>
  );
};

export default Home;
