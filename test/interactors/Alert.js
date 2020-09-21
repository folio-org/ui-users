import { createInteractor } from '@bigtest/interactor';

export default createInteractor('alert')({
  selector: '[role=alert]',
});
