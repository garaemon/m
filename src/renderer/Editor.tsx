import { IpcRendererEvent } from 'electron';
import React, { Component } from 'react';
/* React component provided by the original react-codemirror package does not update view
   even if value state is updated.
   In order to avoid this issue, use react-codemirror2 package.
 */
import { UnControlled as CodeMirror } from 'react-codemirror2';
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
import 'hypermd/addon/fold-link';
import 'hypermd/addon/fold-image';
import 'hypermd/addon/fold-math';
import 'hypermd/addon/fold-html';
import 'hypermd/addon/fold-emoji';
import 'hypermd/addon/read-link';
import 'hypermd/addon/click';
import 'hypermd/addon/hover';
import 'hypermd/addon/paste';
import 'hypermd/addon/insert-file';
import 'hypermd/addon/mode-loader';
import 'hypermd/addon/table-align';

import { IAppConfig } from '../IAppConfig';

interface EditorProps {
}

interface EditorStates {
    content: string;
    shown_content: string;
    config: IAppConfig;
}

export default class Editor extends Component<EditorProps, EditorStates> {
    constructor(props: EditorProps) {
        super(props);
        this.state = {
            content: '', shown_content: '',
            config: {
                foldImage: true,
                foldLink: true,
                foldMath: true,
                foldEmoji: true,
            },
        };
    }

    componentDidMount() {
        console.log('componentDidMount');
        ipcRenderer.on('file-content', (_event: IpcRendererEvent, content: string) => {
            console.log('file-content is called');
            this.setState({ 'content': content });
        });
        ipcRenderer.on('retrieve-content-for-save', (event: IpcRendererEvent) => {
            event.sender.send('retrieve-content-result-for-save', this.state.shown_content);
        });
        ipcRenderer.on('update-config', (_event: IpcRendererEvent, content: IAppConfig) => {
            this.setState({ config: content });
        });
        ipcRenderer.send('render-process-ready');
    }

    onBeforeChange(_editor: codemirror.Editor, _data: codemirror.EditorChange, value: string) {
        this.setState({ 'shown_content': value });
    }

    render() {
        const options = {
            mode: 'hypermd',
            // mode: 'gfm',
            theme: 'hypermd-light',

            hmdFold: {
                image: this.state.config.foldImage,
                link: this.state.config.foldLink,
                math: this.state.config.foldMath,
                emoji: this.state.config.foldEmoji,
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
            onBeforeChange={this.onBeforeChange.bind(this)}
            className="code-mirror-editor"
            options={options} />);
    }

}
