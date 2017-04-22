import React from 'react';
import {connect} from 'react-redux';
import {startLogging, stopLogging} from './Actions';

class Logs extends React.Component {
  componentWillMount() {
    const dispatch = this.props.dispatch;
    dispatch(startLogging());
  }

  componentWillUnmount() {
    const dispatch = this.props.dispatch;
    dispatch(stopLogging());
  }

  render() {
    const {logLines} = this.props;
    return (
      <div className="container">
        <br/><br/>
        Server logs may take a second or two to appear:<br/>
        <br/>
        <pre>
          {logLines}
        </pre>
      </div>
    );
  }
}

Logs.propTypes = {
  logLines: React.PropTypes.string.isRequired,
  dispatch: React.PropTypes.func.isRequired
};

const mapStateToProps = (state) => {
  return {...state.logs};
};

export default connect(mapStateToProps)(Logs);
