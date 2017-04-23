function buildSelectorForCodeBlock(classSelector) {
  return `.markdown-body > pre > code > div.${classSelector}`;
}

function getCodeBlockElements(classSelector) {
  return document.querySelectorAll(buildSelectorForCodeBlock(classSelector));
}

module.exports = {
  getCodeBlockElements: getCodeBlockElements
};
