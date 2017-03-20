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
      const image_src = $(this).attr('src');
      if (!(image_src.startsWith('http://') ||
            image_src.startsWith('https://') ||
            image_src.startsWith('file://') ||
            image_src.startsWith('/'))) {
        $(this).attr('src', path.join(basedir, image_src));
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

class MermaidScriptProcessors extends MarkdownPostProcessor {
  runPostProcess(html, file) {
    return html;                // do nothing
  }
}
module.exports = {
  ImagePathFixer: ImagePathFixer,
  CodeMetaInfoFixer: CodeMetaInfoFixer,
  MermaidScriptProcessors: MermaidScriptProcessors
};
