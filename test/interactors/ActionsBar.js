import { createInteractor } from '@bigtest/interactor';
import Button from './Button';

export default createInteractor('actions bar')({
  selector: 'section[data-test-actions-bar]',
  defaultLocator: () => '',
  actions: {
    clickClaimReturned: async interactor => {
      await interactor.find(Button('Claim returned', { enabled: true })).click();
    }
  }
});
