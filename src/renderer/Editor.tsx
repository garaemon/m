import { IpcRendererEvent } from 'electron';
import React, { Component } from 'react';
/* React component provided by the original react-codemirror package does not update view
   even if value state is updated.
   In order to avoid this issue, use react-codemirror2 package.
 */
import { UnControlled as CodeMirror } from 'react-codemirror2';
import codemirror from 'codemirror';
import Moment from 'moment';

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
import CompleteEmoji from 'hypermd/goods/complete-emoji';
import { ClickInfo } from 'hypermd/addon/click';
import 'hypermd/keymap/hypermd';

import { IAppConfig } from '../IAppConfig';
import { IInsertImageLink } from '../IInsertImageLink';

interface EditorProps {}

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
      content: '',
      shown_content: '',
      config: {
        foldImage: true,
        foldLink: true,
        foldMath: true,
        foldEmoji: true,
        showLineNumber: false,
      },
    };
  }

  componentDidMount() {
    ipcRenderer.on('file-content', (_event: IpcRendererEvent, content: string) => {
      this.setState({ content: content });
    });
    ipcRenderer.on('retrieve-content-for-save', (event: IpcRendererEvent) => {
      event.sender.send('retrieve-content-result-for-save', this.state.shown_content);
      if (document.title.endsWith('*')) {
        document.title = document.title.slice(0, -1);
      }
    });
    ipcRenderer.on('update-config', (_event: IpcRendererEvent, content: IAppConfig) => {
      this.setState({ config: content });
      if (this.editor === null) {
        return;
      }
      this.editor.setOption('hmdFold', {
        image: content.foldImage,
        link: content.foldLink,
        math: content.foldMath,
        emoji: content.foldEmoji,
      });
      this.editor.setOption('lineNumbers', content.showLineNumber);
    });
    ipcRenderer.on('set-title', (_event, content: string) => {
      document.title = content;
    });
    ipcRenderer.on('insert-image-link', (_event, link: IInsertImageLink) => {
      if (this.editor === null) {
        return;
      }
      const doc = this.editor.getDoc();
      doc.replaceRange(`![${link.name}](${link.path})`, doc.getCursor());
    });
    ipcRenderer.on('insert-date', (_event, link: IInsertImageLink) => {
      if (this.editor === null) {
        return;
      }
      const doc = this.editor.getDoc();
      const date_str = Moment().format('YYYY-MM-DD HH:mm:ss');
      doc.replaceRange(date_str, doc.getCursor());
    });
    document.ondragover = document.ondrop = (e) => {
      e.preventDefault();
    };
    document.body.addEventListener('drop', (e) => {
      if (e.dataTransfer !== null) {
        const file = e.dataTransfer.files[0];
        ipcRenderer.send('drag-and-drop', {
          name: file.name,
          path: file.path,
          type: file.type,
        });
      }
    });

    ipcRenderer.send('render-process-ready');
  }

  onBeforeChange(editor: codemirror.Editor, _data: codemirror.EditorChange, value: string) {
    this.setState({ shown_content: value });
  }

  onChange(editor: codemirror.Editor) {
    // not called?
  }

  onEditorDidMount(editor: codemirror.Editor) {
    this.editor = editor;
    /* Use debounce to throttle change event.*/
    const emojiHintFunc = CompleteEmoji.createHintFunc();
    this.editor.on('inputRead', (editor: codemirror.Editor, change: codemirror.EditorChange) => {
      if (!document.title.endsWith('*')) {
        document.title = document.title + '*';
      }
      ipcRenderer.send('changed');
      if (change.text.length === 1 && change.text[0] === ':') {
        codemirror.showHint(editor, emojiHintFunc);
      }
    });

    this.editor.on('cursorActivity', (editor: codemirror.Editor) => {
      if (!this.editor) {
        return;
      }
      const doc = this.editor.getDoc();
      const cursor = doc.getCursor();
      this.updateInputFieldHeight(cursor.line);
    });
  }

  updateInputFieldHeight(line: number) {
    // TODO: The timing to update heightof the parent of the textarea might be slow if this
    // function is registered cursorActivity callback.
    if (this.editor === null) {
      return;
    }
    // Workaround not to hide the input character by IME window.
    // See the following issues and changes:
    // - https://github.com/codemirror/CodeMirror/issues/4089
    // - https://github.com/BoostIO/Boostnote/issues/147
    // - https://github.com/textlint/textlint-app/commit/a25983b1c85a7be1b137bae31f700c59bdc96018
    const inputField = this.editor.getInputField();
    if (!inputField.parentElement) {
      return;
    }
    // In order not to hide the input character by IME window, it is important to move the
    // hidden <textarea> to the bottom of the input character.
    // In the original codemirror implementation, the textarea cannot be moved to the bottom
    // of the input character because of the parent element of the textarea. The style of the
    // parent element has 'height 0px' and 'overflow hidden'. These settings enable to hide
    // input cursor but they does not allow the textarea move to the bottom of the input
    // character. In order to allow it, `height 1em` style is introduced below.

    // Use the cursor element to estimate the height of the current line.
    const scroller = this.editor.getScrollerElement();
    const cursorElement = scroller.getElementsByClassName('CodeMirror-cursor');
    if (cursorElement) {
      const cursorHeight = cursorElement[0].clientHeight;
      inputField.parentElement.style.height = cursorHeight + 'px';
      // Add negative offset to scroller in order to cancel the line height of
      // `inputFIeld.parentElement`.
      scroller.style.top = `-${cursorHeight}px`;
    }
    // `width 0px` is introduced in order to hide the input cursor.
    inputField.parentElement.style.width = '0px';
    this.editor.refresh();
  }

  render() {
    const options = {
      mode: 'hypermd',
      // mode: 'gfm',
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
      hmdClick: this.onClick.bind(this),
      hmdHover: true,
      hmdTableAlign: true,
      lineNumbers: this.state.config.showLineNumber,
      lineWrapping: true,
    };

    return (
      <CodeMirror
        value={this.state.content}
        onBeforeChange={this.onBeforeChange.bind(this)}
        editorDidMount={this.onEditorDidMount.bind(this)}
        onChange={this.onChange.bind(this)}
        className='code-mirror-editor'
        options={options}
      />
    );
  }

  private onClick(info: ClickInfo, _editor: codemirror.Editor) {
    if (
      (info.type === 'link' || info.type === 'url') &&
      (info.ctrlKey || info.altKey || info.shiftKey)
    ) {
      ipcRenderer.send('open-url', info.url);
      // return false to prevent for render process to open new page when clicking link with
      // ctrlKey down.
      return false;
    }
  }
}
