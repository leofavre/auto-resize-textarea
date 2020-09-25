import hasStyleExceptHeightChanged from '../helpers/hasStyleExceptHeightChanged.js';
import pxToNumber from '../helpers/pxToNumber.js';

const WithAutoHeight = (Base = class {}) => class extends Base {
  get baseElement () {
    return this;
  }

  static get observedAttributes () {
    return [
      ...super.observedAttributes || [],
      ...['autoheight', 'rows', 'cols', 'class', 'style']
    ];
  }

  _handleAttributeChange (attrName, oldValue, nextValue) {
    if (oldValue !== nextValue) {
      if (attrName === 'autoheight') {
        if (oldValue == null) {
          this._handleAutoHeightStart();
        } else if (nextValue == null) {
          this._handleAutoHeightEnd();
        }
      }

      if (attrName !== 'style' ||
        hasStyleExceptHeightChanged(oldValue, nextValue)) {
        this._handleChange();
      }
    }
  }

  _handleAutoHeightStart () {
    const changeHandler = this._handleChange.bind(this);
    const resizeHandler = this._handleResize.bind(this);
    this._resizeObserver = new ResizeObserver(changeHandler);
    this._resizeObserver.observe(this.baseElement);
    this.baseElement.addEventListener('input', changeHandler);
    this.baseElement.addEventListener('userresize', resizeHandler);
  }

  _handleAutoHeightEnd () {
    const changeHandler = this._handleChange.bind(this);
    const resizeHandler = this._handleResize.bind(this);
    this._resizeObserver && this._resizeObserver.unobserve(this.baseElement);
    this.baseElement.removeEventListener('input', changeHandler);
    this.baseElement.removeEventListener('userresize', resizeHandler);
  }

  _handleChange () {
    if (this.baseElement.hasAttribute('autoheight')) {
      const { offsetHeight, clientHeight } = this.baseElement;
      const offset = offsetHeight - clientHeight;

      let inner = 0;
      const boxSizing = this._getStyleProp('box-sizing');

      if (boxSizing !== 'border-box') {
        const paddingTop = this._getStyleProp('padding-top');
        const paddingBottom = this._getStyleProp('padding-bottom');
        const borderTop = this._getStyleProp('border-top-width');
        const borderBottom = this._getStyleProp('border-bottom-width');
        inner = paddingTop + paddingBottom + borderTop + borderBottom;
      }

      const { height: prevHeight } = this.baseElement.style;

      this.baseElement.style.minHeight = 'auto';
      this.baseElement.style.height = 'auto';

      const { scrollHeight } = this.baseElement;
      const numericNextMinHeight = scrollHeight + offset - inner;
      const nextMinHeight = `${numericNextMinHeight}px`;
      const numericPrevHeight = pxToNumber(prevHeight);

      let nextHeight = prevHeight;

      if (numericPrevHeight != null) {
        nextHeight = this._resizedByUser
          ? `${Math.max(numericNextMinHeight, numericPrevHeight)}px`
          : `${numericPrevHeight}px`;
      }

      this.baseElement.style.minHeight = nextMinHeight;
      this.baseElement.style.height = nextHeight;
    }
  }

  _handleResize () {
    this._resizedByUser = true;
    this._handleChange();
    this._resizedByUser = false;
  }

  _getStyleProp (str) {
    const elementStyles = window.getComputedStyle(this.baseElement);
    const prop = elementStyles.getPropertyValue(str);

    return prop.endsWith('px')
      ? pxToNumber(prop)
      : prop;
  }
};

export default WithAutoHeight;
