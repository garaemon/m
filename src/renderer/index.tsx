import React from 'react'
import ReactDOM from 'react-dom'

interface MyComponentProps {
    // 必要なプロパティを記述
}

interface MyComponentStates {
    // 必要なプロパティを記述
}

// クラスの場合
class MyComponent extends React.Component<MyComponentProps, MyComponentStates> {
    constructor(props: MyComponentProps) {
        super(props);
        this.state = {
            // MyComponentStates と一致する必要あり
        };
    }
    public render(): React.ReactNode {
        return (<p>Hello World2 222</p>);
    }
}

// レンダリング
ReactDOM.render(<MyComponent/>, document.getElementById('contents'));
