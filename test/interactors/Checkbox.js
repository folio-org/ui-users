import { createInteractor, perform } from '@bigtest/interactor';

export default createInteractor('checkbox')({
  selector: 'input[type=checkbox], input[type=radio]',
  locator: element => element.labels[0].textContent,
  filters: {
    enabled: {
      apply: element => !element.disabled,
      default: true
    },
    name: element => element.name,
    value: element => element.value
  },
  actions: {
    click: perform(element => {
      element.click();
    })
  }
});
