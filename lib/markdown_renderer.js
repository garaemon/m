'use strict';

const fs = require('fs');
const marked = require('marked');
const toc = require('marked-toc');

marked.setOptions({
  highlight: function (code, lang, callback) {
    require('pygmentize-bundled')({ lang: lang, format: 'html' }, code, function (err, result) {
      //callback(err, result.toString());
    });
  }
});

function renderMarkdown(filename) {
  const text = fs.readFileSync(filename, 'utf8');
  const rendered_html = marked(text);
  const toc_html = marked(toc(text, {firsth1: true}));
  return {'contents': rendered_html, 'toc': toc_html};
};

module.exports.renderMarkdown = renderMarkdown;
