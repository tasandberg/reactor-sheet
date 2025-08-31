export default class ContextConnector<T> extends EventTarget {
  constructor() {
    super();
  }

  publishContext(context: T) {
    this.dispatchEvent(new CustomEvent("contextUpdate", { detail: context }));
  }
}
