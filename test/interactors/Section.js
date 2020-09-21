import { createInteractor } from '@bigtest/interactor';

export default createInteractor('section')({
  selector: 'section',
  defaultLocator: element => element.id
});
