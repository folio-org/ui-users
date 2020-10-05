import { createInteractor, perform } from '@bigtest/interactor';

export default createInteractor('text area')({
  selector: 'textarea',
  locator: element => element.labels[0]?.textContent.replace(/\*$/, '').trim(),
  filters: {
    disabled: element => element.disabled,
    enabled: element => !element.disabled,
    name: element => element.name,
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
