import {IpcRendererEvent} from 'electron';
import React, {Component} from 'react';
/* React component provided by the original react-codemirror package does not update view
   even if value state is updated.
   In order to avoid this issue, use react-codemirror2 package.
 */
import {UnControlled as CodeMirror} from 'react-codemirror2';
import * as codemirror from 'codemirror';
const ipcRenderer = window.require('electron').ipcRenderer;

import 'codemirror/lib/codemirror.css';
import 'hypermd/mode/hypermd.css';
import 'hypermd/theme/hypermd-light.css';

import 'codemirror/lib/codemirror';

import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/xml/xml';
import 'codemirror/mode/markdown/markdown';
import 'codemirror/mode/gfm/gfm';

import 'hypermd/core';
import 'hypermd/mode/hypermd';

import 'hypermd/addon/hide-token';
import 'hypermd/addon/cursor-debounce';
import 'hypermd/addon/fold';
import 'hypermd/addon/read-link';
import 'hypermd/addon/click';
import 'hypermd/addon/hover';
import 'hypermd/addon/paste';
import 'hypermd/addon/insert-file';
import 'hypermd/addon/mode-loader';
import 'hypermd/addon/table-align';

interface EditorProps {
}

interface EditorStates {
    content: string;
}


export default class Editor extends Component<EditorProps, EditorStates> {
    // private codeMirrorRef: React.Ref;
    // private codeMirrorRef = React.createRef<CodeMirror.CodeMirror>();
    // private codeMirrorRef  : React.RefObject<HTMLInputElement>;

    constructor(props: EditorProps) {
        super(props);
        this.state = {'content': ''};
    }

    componentDidMount() {
        console.log('hoge');
        ipcRenderer.on('file-content', (_event : IpcRendererEvent, content: string) => {
            console.log('file-content', content);
            this.setState({'content': content});
            //this.codeMirrorRef.editor.setValue(content);
        });
    }

    onChange(editor: codemirror.Editor, data: codemirror.EditorChange, value:string) {
        // Not yet implemented
    }

    render() {
        console.log('render', this.state.content);
        const options = {
            mode: 'hypermd',
            // mode: 'gfm',
            theme: 'hypermd-light',

            hmdFold: {
                image: true,
                link: true,
                math: true,
            },
            hmdHideToken: true,
            hmdCursorDebounce: true,
            hmdPaste: true,
            hmdClick: true,
            hmdHover: true,
            hmdTableAlign: true,
        };

        return (<CodeMirror
                value={this.state.content}
                onChange={this.onChange}
                className="code-mirror-editor"
                options={options} />);
    }

}
