import { createInteractor, perform } from '@bigtest/interactor';

export default createInteractor('li')({
  selector: 'li',
  defaultLocator: element => element.id,
  actions: {
    click: perform((element) => {
      element.click();
    })
  }
});
