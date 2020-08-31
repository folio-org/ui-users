import { createInteractor } from '@bigtest/interactor';

export default createInteractor('dropdown menu')({
  selector: '[data-test-dropdown-menu-overlay]',
  defaultLocator: () => ''
});
