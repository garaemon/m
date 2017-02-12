'use strict';

const fs = require('fs');
const path = require('path');

const cheerio = require('cheerio');
const log = require('color-log');
const marked = require('marked');
const toc = require('marked-toc');
const highlightjs = require('highlight.js');


marked.setOptions({
  highlight: function (code, lang, callback) {
    try {
      return highlightjs.highlight(lang, code).value;
    } catch (e) {
      log.error('highlight.js error: ' + e.message);
      return code;
    }
  },
  breaks: true,
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

function renderMarkdown(filename) {
  const text = fs.readFileSync(filename, 'utf8');
  const rendered_html = runPostProcessForMarkdownHTML(marked(text), filename);
  const toc_html = marked(toc(text, {firsth1: true}));
  return {'contents': rendered_html, 'toc': toc_html};
};

module.exports.renderMarkdown = renderMarkdown;
