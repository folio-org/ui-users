import { createInteractor, perform } from '@bigtest/interactor';

export default createInteractor('search')({
  selector: '[type=search]',
  locator: element => element.id,
  filters: {
    disabled: element => element.disabled,
    enabled: element => !element.disabled,
    value: element => element.value
  },
  actions: {
    fill: perform((element, value) => {
      const descriptor = Object.getOwnPropertyDescriptor(element, 'value');
      if (descriptor) delete element.value;
      element.value = value;
      element.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
      element.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
      if (descriptor) {
        Object.defineProperty(element, 'value', descriptor);
      }
    })
  }
});
