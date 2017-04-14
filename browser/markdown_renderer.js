'use strict';

const fs = require('fs');

const async = require('async');
const cheerio = require('cheerio');
const highlightjs = require('highlight.js');
const log = require('winston');
const marked = require('marked');
const toc = require('marked-toc');

const HighlightPlugin = require('./markdown_highlight_plugin.js');
const PostProcessor = require('./markdown_post_processor.js');

/**
 * MarkdownRenderer is a class to provide some static methods.
 */
class MarkdownRenderer {

  constructor() {
    /**
     * post processing plugins
     */
    this.postProcessPlugins = [
      new PostProcessor.ImagePathFixer(),
      new PostProcessor.CodeMetaInfoFixer(),
      new PostProcessor.MermaidScriptProcessors()
    ];

    /**
     * highlight plugins.
     *
     * the keys of highlightPlugins are regarded as language name of
     * code blocks.
     */
    this.highlightPlugins = {
      'default': new HighlightPlugin.DefaultHighlighter(),
      'undefined': new HighlightPlugin.UndefinedHighlighter(),
      'mathjax': new HighlightPlugin.MathjaxHighlighter(),
      'mermaid': new HighlightPlugin.MermaidHighlighter()
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
      return this.highlightPlugins['undefined'];
    } else {
      if (lang in this.highlightPlugins) {
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
    const self = this;
    fs.readFile(file, 'utf8', function(err, text) {
      if (err != null) {
        callback(err, null);
      } else {
        marked(text, function(err, markdownHtml) {
          const renderedHtml = self.runPostProcessForMarkdownHTML(markdownHtml, file);
          const tocHtml = marked(toc(text, {firsth1: true}));
          callback(err, {'contents': renderedHtml, 'toc': tocHtml});
        });
      }
    });
  }
}

module.exports.MarkdownRenderer = MarkdownRenderer;
