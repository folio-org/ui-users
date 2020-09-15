import { createInteractor, perform } from '@bigtest/interactor';

export default createInteractor('calendar button')({
  selector: 'td[role=button]',
  actions: {
    click: perform((element) => {
      element.click();
    })
  }
});
