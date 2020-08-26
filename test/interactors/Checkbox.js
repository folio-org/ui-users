import { createInteractor, perform } from '@bigtest/interactor';

export default createInteractor('checkbox')({
  selector: 'input[type=checkbox]',
  defaultLocator: element => element.labels[0].textContent,
  locators: {
    findByName: element => element.name
  },
  filters: {
    enabled: {
      apply: element => !element.disabled,
      default: true
    }
  },
  actions: {
    click: perform(element => {
      element.click();
    })
  }
});
