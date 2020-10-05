import { createInteractor } from '@bigtest/interactor';

export default createInteractor('b')({
  selector: 'b',
  locator: element => element.textContent
});
