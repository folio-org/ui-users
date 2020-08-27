import { createInteractor } from '@bigtest/interactor';
import Button from './Button';

export default createInteractor('actions dropdown')({
  selector: '[data-test-actions-dropdown]',
  defaultLocator: () => '',
  actions: {
    toggle: async interactor => {
      await interactor.find(Button.findByAriaLabel('ellipsis')).click();
    }
  }
});
