import { IpcRendererEvent } from 'electron';
import React, { Component } from 'react';
/* React component provided by the original react-codemirror package does not update view
   even if value state is updated.
   In order to avoid this issue, use react-codemirror2 package.
 */
import { UnControlled as CodeMirror } from 'react-codemirror2';
import codemirror from 'codemirror';
import { debounce } from 'lodash';

const ipcRenderer = window.require('electron').ipcRenderer;

import 'codemirror/lib/codemirror.css';
import './theme/m.scss';

import 'codemirror/lib/codemirror';

import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/xml/xml';
import 'codemirror/mode/markdown/markdown';
import 'codemirror/mode/gfm/gfm';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/hint/show-hint.css';

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

import 'hypermd/keymap/hypermd';

import { IAppConfig } from '../IAppConfig';
import { emojiList } from './EmojiList';

interface EditorProps {
}

interface EditorStates {
    content: string;
    shown_content: string;
    config: IAppConfig;
}

export default class Editor extends Component<EditorProps, EditorStates> {
    private editor: codemirror.Editor | null = null;

    constructor(props: EditorProps) {
        super(props);
        this.editor = null;
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
        ipcRenderer.on('file-content', (_event: IpcRendererEvent, content: string) => {
            this.setState({ 'content': content });
        });
        ipcRenderer.on('retrieve-content-for-save', (event: IpcRendererEvent) => {
            event.sender.send('retrieve-content-result-for-save', this.state.shown_content);
            if (document.title.endsWith('*')) {
                document.title = document.title.slice(0, -1);
            }
        });
        ipcRenderer.on('update-config', (_event: IpcRendererEvent, content: IAppConfig) => {
            this.setState({ config: content });
        });
        ipcRenderer.on('set-title', (_event, content: string) => {
            document.title = content;
        });
        ipcRenderer.send('render-process-ready');
    }

    onBeforeChange(editor: codemirror.Editor, _data: codemirror.EditorChange, value: string) {
        this.setState({ 'shown_content': value });
        if (!document.title.endsWith('*')) {
            document.title = document.title + '*';
        }
    }

    onChange(editor: codemirror.Editor) {
        // not called?
    }

    onEditorDidMount(editor: codemirror.Editor) {
        this.editor = editor;
        /* Use debounce to throttle change event.*/
        this.editor.on('change', debounce((editor: codemirror.Editor) => {
            codemirror.showHint(editor, undefined, {
                completeSingle: false, hint: () => { return this.emojiComplete(editor); },
            });
        }, 500));
    }

    emojiComplete(editor: codemirror.Editor): codemirror.Hints {
        const cur = editor.getCursor();
        const token = editor.getTokenAt(cur);
        const start = token.start;
        const end = cur.ch;
        const line = cur.line;
        const emptyResult = {
            list: [],
            from: codemirror.Pos(0, 0),
            to: codemirror.Pos(0, 0),
        };;

        // ch is the position of word.
        // ch starts with current cursor position and move it left until find ':'.
        // If current line is 'abc :foo bar', The tokens are 'abc', ' ', ':', 'foo', ' ', 'bar'.
        // Be careful that ':' is not included in a token with trailing characters.
        let previousWord = token.string;
        for (let ch = cur.ch;
            ch > -1 /* Till the beggining of the line*/;
            --ch /* move cursor to left */) {
            const currentToken = editor.getTokenAt({ ch, line }).string;
            // if currentToken is a white space, immediately stops completion because it
            // means looping over multiple words.
            if (/\s/.test(currentToken)) {
                return emptyResult;
            }

            if (currentToken == ':') {
                const filteredList = emojiList.filter((item) => {
                    return item.startsWith(previousWord);
                });
                if (filteredList.length > 0) {
                    return {
                        list: filteredList.map((candidate) => { return candidate + ':'; }),
                        from: codemirror.Pos(cur.line, start),
                        to: codemirror.Pos(cur.line, end)
                    };
                }
            }
            // Memorize current currentToken for next loop because emoji-like string, such as :foo,
            // will be devided into two tokens; one is trailing word and the other is ':'.
            // If the next loop find ':' as currentToken, the completion will be based on
            // previousWord.
            previousWord = currentToken;
        }

        return emptyResult;
    }

    render() {
        const options = {
            mode: 'hypermd',
            // mode: 'gfm',
            // theme: 'hypermd-light',
            theme: 'm',
            keyMap: 'hypermd',

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

            lineWrapping: true,
        };

        return (<CodeMirror
            value={this.state.content}
            onBeforeChange={this.onBeforeChange.bind(this)}
            editorDidMount={this.onEditorDidMount.bind(this)}
            onChange={this.onChange.bind(this)}
            className="code-mirror-editor"
            options={options} />);
    }

}
