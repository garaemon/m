import React from 'react';
import { Switch, Route, Link, HashRouter as Router } from 'react-router-dom';
import ReactDOM from 'react-dom';
import { BrowserWindow } from 'electron';
import CssBaseLine from '@material-ui/core/CssBaseline';
import { Provider } from 'react-redux';

import Editor from './components/Editor';
import Settings from './components/Settings';
import store from './store';

interface MMainComponentProps {};

const MMainComponent : React.SFC<MMainComponentProps> = (props: MMainComponentProps) => {
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
};




ReactDOM.render(
  <Provider store={store}>
    <MMainComponent />
  </Provider>
  , document.getElementById('contents'));
