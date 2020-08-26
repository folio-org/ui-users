import { createInteractor } from '@bigtest/interactor';

export default createInteractor('actions bar')({
  selector: 'section[data-test-actions-bar]',
  defaultLocator: () => ''
});
