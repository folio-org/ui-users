import { createInteractor, perform } from '@bigtest/interactor';

export default createInteractor('li')({
  selector: 'li',
  locator: element => element.id,
  actions: {
    click: perform((element) => {
      element.click();
    })
  }
});
