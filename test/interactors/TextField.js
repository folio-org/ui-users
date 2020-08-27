import { createInteractor, perform } from '@bigtest/interactor';

export default createInteractor('text field')({
  selector: 'input[type=text], input[type=password]',
  defaultLocator: element => element.labels[0]?.textContent,
  filters: {
    enabled: {
      apply: element => !element.disabled,
      default: true
    },
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
