const path = require('path');

const log = require('winston');
const cheerio = require('cheerio');

class MarkdownPostProcessor {
  runPostProcess(html, filename) {
    log.error('runPostProcess should be overloaded');
  }
}

class ImagePathFixer extends MarkdownPostProcessor {
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

class CodeMetaInfoFixer extends MarkdownPostProcessor {
  runPostProcess(html, file) {
    const $ = cheerio.load(html);
    $('pre code-meta-info').each(function(index, element) {
      $(this).insertBefore($(this).parent().parent());
    });
    return $.html();
  }
}

module.exports = {
  ImagePathFixer: ImagePathFixer,
  CodeMetaInfoFixer: CodeMetaInfoFixer
};
