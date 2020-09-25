import { createInteractor, perform } from '@bigtest/interactor';

export default createInteractor('button')({
  selector: 'button',
  defaultLocator: element => element.textContent,
  locators: {
    findByAriaLabel: element => element.getAttribute('aria-label')?.trim(),
    findById: element => element.getAttribute('id'),
    findByAttribute: element => element.getAttributeNames().find(attr => /data-test/.exec(attr))
  },
  filters: {
    enabled: element => !element.disabled,
    disabled: element => element.disabled,
    ariaExpanded: element => element.getAttribute('aria-expanded')
  },
  actions: {
    click: perform((element) => {
      element.click();
    })
  }
});
