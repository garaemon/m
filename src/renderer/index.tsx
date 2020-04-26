import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserWindow } from 'electron';

import Editor from './Editor';

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
    return <Editor />;
  }
}

// レンダリング
ReactDOM.render(<MMainComponent />, document.getElementById('contents'));
