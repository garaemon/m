const log = require('winston');

class PostProcessPluginBase {
  runPostProcess(html, filename) {
    log.error('runPostProcess should be overloaded');
  }
}

module.exports = PostProcessPluginBase;
