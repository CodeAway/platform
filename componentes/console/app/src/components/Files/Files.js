import React from 'react';
import {connect} from 'react-redux';
import AceEditor from 'react-ace';
import {EDIT_FILE} from '../Code/Actions';
import 'brace/theme/solarized_light';
import 'brace/mode/javascript';
import 'brace/mode/css';
import 'brace/mode/html';
import 'brace/mode/python';
import 'brace/mode/c_cpp';
import 'brace/mode/java';
import 'brace/mode/json';
import 'brace/mode/golang';
import 'brace/mode/ruby';
import 'brace/ext/language_tools';

const Files = ({editFiles, fileName, dispatch}) => {
  const styles = require('./Files.scss');
  const ftMap = {
    js: 'javascript',
    html: 'html',
    css: 'css',
    py: 'python',
    java: 'java',
    xml: 'xml',
    rb: 'ruby',
    scss: 'sass',
    md: 'markdown',
    markdown: 'markdown',
    json: 'json',
    go: 'golang',
    c: 'c_cpp',
    cpp: 'c_cpp'
  };

  const _ext = fileName.split('.');
  const extension = _ext[_ext.length - 1];

  const content = editFiles[decodeURIComponent(fileName)].content;
  return (
      <div className={styles.fileContainer}>
        <h3><code>{fileName}{editFiles[fileName].dirty ? '*' : ''}</code></h3>
        <AceEditor
          mode={ftMap[extension]}
          theme="solarized_light"
          name="currentFile"
          minLines={8}
          maxLines={40}
          width="90%"
          fontSize={14}
          setOptions={{
            wrap: true
          }}
          value={content}
          onChange={(newContent) => {
            dispatch({type: EDIT_FILE, data: {fileName, content: newContent}});
          }}/>
      </div>
  );
};

const mapStateToProps = (state, ownProps) => {
  return {
    fileName: ownProps.params.fileName,
    ...state.code
  };
};

export default connect(mapStateToProps)(Files);
