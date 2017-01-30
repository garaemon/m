'use strict';

const fs = require('fs');
const marked = require('marked');

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
  return rendered_html;
};

module.exports.renderMarkdown = renderMarkdown;
