export class AutomaticallyResizableTextArea extends HTMLTextAreaElement {
  constructor () {
    super();
    this.__handleChange = this.__handleChange.bind(this);
  }

  get autoresize () {
    return this.autoResize;
  }

  set autoresize (value) {
    this.autoResize = value;
  }

  get autoResize () {
    return this.hasAttribute('autoresize');
  }

  set autoResize (value) {
    if (value) {
      this.setAttribute('autoresize', '');
    } else {
      this.removeAttribute('autoresize');
    }
  }

  static get observedAttributes () {
    return [
      ...super.observedAttributes || [],
      'autoresize',
      'rows'
    ];
  }

  attributeChangedCallback (...args) {
    super.attributeChangedCallback && super.attributeChangedCallback(...args);
    const [attrName] = args;

    if (attrName === 'autoresize' || attrName === 'rows') {
      this.__handleChange();
    }
  }

  connectedCallback () {
    super.connectedCallback && super.connectedCallback();
    this.__resizeObserver = new ResizeObserver(this.__handleChange);
    this.__resizeObserver.observe(this);
    this.addEventListener('input', this.__handleChange);
  }

  disconnectedCallback () {
    super.disconnectedCallback && super.disconnectedCallback();
    this.__resizeObserver.unobserve(this);
    this.removeEventListener('input', this.__handleChange);
  }

  __handleChange () {
    if (this.autoResize) {
      const offset = this.offsetHeight - this.clientHeight;
      this.style.minHeight = 'auto';
      this.style.minHeight = this.scrollHeight + offset + 'px';
    }
  }
}
