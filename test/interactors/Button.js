import { createInteractor, perform } from '@bigtest/interactor';

export default createInteractor('button')({
  selector: 'button',
  locator: element => element.textContent,
  filters: {
    ariaExpanded: element => element.getAttribute('aria-expanded'),
    ariaLabel: element => element.getAttribute('aria-label')?.trim(),
    attribute: element => element.getAttributeNames().find(attr => /data-test/.exec(attr)),
    disabled: element => element.disabled,
    enabled: element => !element.disabled,
    id: element => element.getAttribute('id')
  },
  actions: {
    click: perform((element) => {
      element.click();
    })
  }
});
