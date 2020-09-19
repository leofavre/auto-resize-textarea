import removeStyleProp from './removeStyleProp.js';

const ignoreHeight = removeStyleProp('height');
const ignoreMinHeight = removeStyleProp('min-height');

export default (prevStyle, nextStyle) => {
  if (prevStyle == null || nextStyle == null) {
    return false;
  }

  return ignoreHeight(ignoreMinHeight(prevStyle)).trim() !==
    ignoreHeight(ignoreMinHeight(nextStyle)).trim();
};