import { createInteractor } from '@bigtest/interactor';
import Button from './Button';

export default createInteractor('actions dropdown')({
  selector: '[data-test-actions-dropdown]',
  actions: {
    toggle: async interactor => {
      await interactor.find(Button({ ariaLabel: 'ellipsis' })).click();
    }
  }
});
