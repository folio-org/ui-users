import { createInteractor, perform } from '@bigtest/interactor';

export default createInteractor('link')({
  selector: 'a',
  actions: {
    click: perform((element) => {
      element.click();
    })
  }
});
