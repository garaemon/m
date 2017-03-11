'use strict';

const fs = require('fs');

const async = require('async');
const cheerio = require('cheerio');
const highlightjs = require('highlight.js');
const log = require('winston');
const marked = require('marked');
const toc = require('marked-toc');

const highlight_plugin = require('./markdown_highlight_plugin.js');
const post_processor = require('./markdown_post_processor.js');

/**
 * MarkdownRenderer is a class to provide some static methods.
 */
class MarkdownRenderer {

  constructor() {
    /**
     * post processing plugins
     */
    this.post_process_plugins = [
      new post_processor.ImagePathFixer(),
      new post_processor.CodeMetaInfoFixer()
    ];

    /**
     * highlight plugins
     */
    this.highlight_plugins = {
      'default': new highlight_plugin.DefaultHighlighter(),
      'undefined': new highlight_plugin.UndefinedHighlighter(),
      'mathjax': new highlight_plugin.MathjaxHighlighter()
    };
  }

  /**
   * computeCodeMetaInfoTag
   */
  computeCodeMetaInfoTag(code, lang, errors) {
    if (lang == undefined) {
        return `<code-meta-info>${code}</code-meta-info>`;
    } else {
      if (!!errors) {
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
      breaks: true
    });
  }

  getHighlightPlugin(lang) {
    if (lang == undefined) {
      return this.highlight_plugins['undefined'];
    } else {
      if (lang in this.highlight_plugins) {
        return this.highlight_plugins[lang];
      } else {
        return this.highlight_plugins['default'];
      }
    }
  }

  highlight(code, lang, callback) {
    const plugin = this.getHighlightPlugin(lang);
    // TODO: add lang meta info
    const self = this;
    plugin.highlight(code, lang, function(err, highlight_err, code) {
      const code_meta_info = self.computeCodeMetaInfoTag(code, lang, highlight_err);
      if (err != null) {
        // TODO: what will happen?
        callback(err, code);
      } else {
        callback(null, code_meta_info + code);
      }
    });
  }

  runPostProcessForMarkdownHTML(markdown_html, file) {
    for (let i = 0; i < this.post_process_plugins.length; ++i) {
      const plugin = this.post_process_plugins[i];
      markdown_html = plugin.runPostProcess(markdown_html, file);
    }
    return markdown_html;
  }

  /**
   * file - file to render
   * callback - callback function called when rendering is done.
   */
  render(file, callback) {
    this.setupMarkedOptions();
    const self = this;
    fs.readFile(file, 'utf8', function(err, text) {
      if (err != null) {
        callback(err, null);
      } else {
        marked(text, function(err, markdown_html) {
          const rendered_html = self.runPostProcessForMarkdownHTML(markdown_html, file);
          const toc_html = marked(toc(text, {firsth1: true}));
          callback(err, {'contents': rendered_html, 'toc': toc_html});
        });
      }
    });
  }
}

module.exports.MarkdownRenderer = MarkdownRenderer;
