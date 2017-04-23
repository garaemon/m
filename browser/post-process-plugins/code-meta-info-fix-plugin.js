const cheerio = require('cheerio');

const PostProcessPluginBase = require('./post-process-plugin-base.js');

class CodeMetaInfoFixPlugin extends PostProcessPluginBase {
  runPostProcess(html, file) {
    const $ = cheerio.load(html);
    $('pre code-meta-info').each(function(index, element) {
      $(this).insertBefore($(this).parent().parent());
    });
    return $.html();
  }
}

module.exports = CodeMetaInfoFixPlugin;
