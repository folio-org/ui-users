import { createInteractor, perform } from '@bigtest/interactor';

export default createInteractor('table column header')({
  selector: '[role=columnheader]',
  actions: {
    click: perform(element => {
      element.querySelector('[role=button]').click();
    })
  }
});
