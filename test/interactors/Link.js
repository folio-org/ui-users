import { createInteractor, perform } from '@bigtest/interactor';

export default createInteractor('link')({
  selector: 'a',
  filters: {
    id: element => element.id,
    value: element => element.textContent
  },
  actions: {
    click: perform((element) => {
      element.click();
    })
  }
});
