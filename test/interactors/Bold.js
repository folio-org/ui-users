import { createInteractor } from '@bigtest/interactor';

export default createInteractor('b')({
  selector: 'b',
  defaultLocator: element => element.textContent
});
