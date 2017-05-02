import React from 'react';
import {connect} from 'react-redux';
import globals from '../../Globals';

const Home = ({user}) => {
  return (
    <div className="container">
      <div className="row">
        <div className="col-md-7">
          <h3>Using the console</h3>
          <div>
            <p>
              This console allows you to write server-side code and deploy it to your website. Learn
              how this console actually works in the section below.
            </p>
            <hr/>
            <h4>1. How to write code & test your app</h4>
            <ul>
              <li>Click on a filename. Edit its contents.</li>
              <li>Click on <code>Save & Run</code>.</li>
              <li>Click on the <code>Output</code> link or open it in a new tab to see what is happening to your server process</li>
              <li>Click on the <code>Go to app</code> link, or open it in a new tab</li>
              <li>Your app is now live! (It may take a few minutes before you see your changes applied)</li>
            </ul>
            <hr/>
            <h4>2. Your source code</h4>
            <p>
              Files on the sidebar represent the source code of your web app. These files
              are all actually saved in a git repository on your github account. This console allows you
              to edit these files, deploy your app, and save these files back to your github repository.<br/>
            </p>
            <hr/>
            <h4>3. Editing your files</h4>
            <p>
              To edit your files, choose the filename from the sidebar and edit it.
              When you edit files, these files are not saved back to your github repository. If you make any changes
              to your files and refresh this page then you will notice that your changes have disappeared.
            </p>
            <hr/>
            <h4>4. Saving your files to github</h4>
            <p>
              After you make changes to your file, any unsaved changes will be noticed and a <code>*</code> will appear
              next to the filename. If you click the <code>Run</code> button, these files will be saved to your github repo.
            </p>
            <hr/>
            <h4>5. Deploying your app with changes to source code</h4>
            <p>
              When you click on the <code>Save & Run</code>button on the sidebar, the files in this console are committed
              to your github project and your server process is restarted with these new changes. Your server is accessible on a URL
              unique to your server: <a href={`http://${user.table.username}.app.${globals.projectDomain}`}>{user.table.username}.app.{globals.projectDomain}</a>
              <br/>
              <b>Note:</b>Files that are deployed to the server are files as they are currently on this console. These files may or may not be
              saved to your github repo.
            </p>
            <hr/>
          </div>
          <br/>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {user: state.user};
};

export default connect(mapStateToProps)(Home);
