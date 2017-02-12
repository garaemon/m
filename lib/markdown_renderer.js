'use strict';

const fs = require('fs');
const path = require('path');

const async = require('async');
const cheerio = require('cheerio');
const highlightjs = require('highlight.js');
const log = require('color-log');
const marked = require('marked');
const mjAPI = require("mathjax-node/lib/mj-single.js");
const toc = require('marked-toc');


// setup mathjax
mjAPI.config({
  MathJax: {
    // traditional MathJax configuration
  }
});
mjAPI.start();

marked.setOptions({
  highlight: function (code, lang, callback) {
    // No language is specified
    if (lang === undefined) {
      callback(null, code);
    } else if (lang == 'mathjax') {
      let mathjax_html = '';
      mjAPI.typeset({
        math: code,
        format: 'TeX', // 'inline-TeX', 'MathML'
        renderer: 'SVG',
        svg: true
      }, function (data) {
        //console.log(data);
        callback(data.errors, data.svg);
      });
    } else {
      try {
        callback(null, highlightjs.highlight(lang, code).value);
      } catch (e) {
        log.error('highlight.js error: ' + e.message);
        callback(null, code);
      }
    }
  },
  breaks: true
});

function runPostProcessForMarkdownHTML(html, basefile) {
  let $ = cheerio.load(html);
  const basedir = path.dirname(basefile);
  // relative src path in img tag should be resolved from basedir.
  $('img').each(function(index, element) {
    const image_src = $(this).attr('src');
    if (!(image_src.startsWith('http://') ||
          image_src.startsWith('https://') ||
          image_src.startsWith('file://') ||
          image_src.startsWith('/'))) {
      $(this).attr('src', path.join(basedir, image_src));
    }
  });

  return $.html();
};

function renderMarkdown(filename, callback) {
  const text = fs.readFileSync(filename, 'utf8');
  marked(text, function(err, markdown_html) {
    const rendered_html = runPostProcessForMarkdownHTML(markdown_html, filename);
    const toc_html = marked(toc(text, {firsth1: true}));
    callback(err, {'contents': rendered_html, 'toc': toc_html});
  });
};

module.exports.renderMarkdown = renderMarkdown;
