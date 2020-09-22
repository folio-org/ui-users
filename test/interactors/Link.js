import { createInteractor, perform } from '@bigtest/interactor';

export default createInteractor('link')({
  selector: 'a',
  locators: {
    findById: element => element.id
  },
  filters: {
    value: element => element.textContent
  },
  actions: {
    click: perform((element) => {
      element.click();
    })
  }
});
