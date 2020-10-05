import { createInteractor } from '@bigtest/interactor';

export default createInteractor('div')({
  selector: 'div[class^=col]',
  locator: element => element.textContent,
  filters: {
    value: element => element.textContent
  }
});
