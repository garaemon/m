import React from 'react';
import { Switch, Route, Link, HashRouter as Router } from 'react-router-dom';
import ReactDOM from 'react-dom';
import { BrowserWindow } from 'electron';
import CssBaseLine from '@material-ui/core/CssBaseline';

import Editor from './Editor';
import Settings from './Settings';

interface MMainComponentProps {
  // 必要なプロパティを記述
}

interface MMainComponentStates {
  // 必要なプロパティを記述
}

// クラスの場合
class MMainComponent extends React.Component<MMainComponentProps, MMainComponentStates> {
  constructor(props: MMainComponentProps) {
    super(props);
    this.state = {
      // MMainComponentStates と一致する必要あり
    };
  }
  public render(): React.ReactNode {
    return (
      <Router>
        <CssBaseLine />
        <Switch>
          <Route path='/editor'>
            <Editor></Editor>
          </Route>
          <Route path='/settings'>
            <Settings></Settings>
          </Route>
        </Switch>
      </Router>
    );
  }
}

// レンダリング
ReactDOM.render(<MMainComponent />, document.getElementById('contents'));
