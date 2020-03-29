import codemirror from 'codemirror';

declare function createHintFunc(): codemirror.HintFunction;
declare module 'complete-emoji' {
    export = createHintFunc;
}
