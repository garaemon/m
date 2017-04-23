const path = require('path');

const cheerio = require('cheerio');

const PostProcessPluginBase = require('./post-process-plugin-base.js');

class ImagePathFixPlugin extends PostProcessPluginBase {
  runPostProcess(html, filename) {
    const $ = cheerio.load(html);
    const basedir = path.dirname(filename);
    // relative src path in img tag should be resolved from basedir.
    $('img').each(function(index, element) {
      const imageSrc = $(this).attr('src');
      if (!(imageSrc.startsWith('http://') ||
            imageSrc.startsWith('https://') ||
            imageSrc.startsWith('file://') ||
            imageSrc.startsWith('/'))) {
        $(this).attr('src', path.join(basedir, imageSrc));
      }
    });
    return $.html();
  }
}

module.exports = ImagePathFixPlugin;
