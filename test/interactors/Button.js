import { createInteractor, perform } from '@bigtest/interactor';

export default createInteractor('button')({
  selector: 'button',
  locators: {
    findByAriaLabel: element => element.getAttribute('aria-label')?.trim(),
    findById: element => element.getAttribute('id')
  },
  filters: {
    enabled: element => !element.disabled,
    disabled: element => element.disabled
  },
  actions: {
    click: perform((element) => {
      element.click();
    })
  }
});
