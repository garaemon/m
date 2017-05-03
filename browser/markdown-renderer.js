'use strict';

const fs = require('fs');

const marked = require('marked');
const toc = require('marked-toc');

const postProcessPlugins = require('./post-process-plugins');
const HighlightPlugins = require('./highlight-plugins');

/**
 * MarkdownRenderer is a class to provide some static methods.
 */
class MarkdownRenderer {

  constructor() {
    /**
     * post processing plugins
     */
    this.postProcessPlugins = [
      new postProcessPlugins.ImagePathFixPlugin(),
      new postProcessPlugins.CodeMetaInfoFixPlugin(),
    ];

    /**
     * highlight plugins.
     *
     * the keys of highlightPlugins are regarded as language name of
     * code blocks.
     */
    this.highlightPlugins = HighlightPlugins;
  }

  /**
   * computeCodeMetaInfoTag
   */
  computeCodeMetaInfoTag(code, lang, errors) {
    if (lang == undefined) {
      return `<code-meta-info>${code}</code-meta-info>`;
    } else {
      if (errors) {
        return `<code-meta-info language="${lang}"
                                error-string="${errors}">${code}</code-meta-info>`;
      } else {
        return `<code-meta-info language="${lang}">${code}</code-meta-info>`;
      }
    }
  }

  /**
   * setup options for marked library.
   * marked library requires 'global' option setting via
   * `marked.setOptions`.
   * In MarkdownRender class, syntax highlighting is managed as
   * plugin architecture and the callback function which called to highlight code block.
   */
  setupMarkedOptions() {
    const self = this;
    marked.setOptions({
      highlight: function(code, lang, callback) {
        self.highlight(code, lang, callback);
      },
      breaks: true,
    });
  }

  getHighlightPlugin(lang) {
    if (lang == undefined) {
      return this.highlightPlugins['undefined'];
    } else {
      if (lang in this.highlightPlugins) {
        // If specialized plugin is found, use that plugin
        return this.highlightPlugins[lang];
      } else {
        return this.highlightPlugins['default'];
      }
    }
  }

  highlight(code, lang, callback) {
    const plugin = this.getHighlightPlugin(lang);
    // TODO: add lang meta info
    const self = this;
    plugin.highlight(code, lang, function(err, highlightErr, code) {
      const codeMetaInfo = self.computeCodeMetaInfoTag(code, lang, highlightErr);
      if (err != null) {
        // TODO: what will happen?
        callback(err, code);
      } else {
        callback(null, codeMetaInfo + code);
      }
    });
  }

  runPostProcessForMarkdownHTML(markdownHtml, file) {
    for (let i = 0; i < this.postProcessPlugins.length; ++i) {
      const plugin = this.postProcessPlugins[i];
      markdownHtml = plugin.runPostProcess(markdownHtml, file);
    }
    return markdownHtml;
  }

  /**
   * file - file to render
   * callback - callback function called when rendering is done.
   */
  render(file, callback) {
    this.setupMarkedOptions();
    fs.readFile(file, 'utf8', (err, text) => {
      if (err != null) {
        callback(err, null);
      } else {
        marked(text, (err, markdownHtml) => {
          const renderedHtml = this.runPostProcessForMarkdownHTML(markdownHtml, file);
          const tocHtml = marked(toc(text, {firsth1: true}));
          callback(err, {
            'contents': renderedHtml,
            'toc': tocHtml,
            'file': file,
          });
        });
      }
    });
  }
}

module.exports = MarkdownRenderer;
