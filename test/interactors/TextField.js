import { createInteractor, perform } from '@bigtest/interactor';

export default createInteractor('text field')({
  selector: 'input[type=text], input[type=password]',
  defaultLocator: element => element.labels[0]?.textContent,
  locators: {
    findById: element => element.id
  },
  filters: {
    enabled: element => !element.disabled,
    disabled: element => element.disabled,
    value: element => element.value
  },
  actions: {
    fill: perform((element, value) => {
      const descriptor = Object.getOwnPropertyDescriptor(element, 'value');
      if (descriptor) delete element.value;
      element.value = value;
      element.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
      element.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
      element.dispatchEvent(new Event('blur', { bubbles: true, cancelable: true }));
      if (descriptor) {
        Object.defineProperty(element, 'value', descriptor);
      }
    })
  }
});
