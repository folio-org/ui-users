import { createInteractor } from '@bigtest/interactor';
import Button from './Button';

export default createInteractor('actions bar')({
  selector: 'section[data-test-actions-bar]',
  defaultLocator: () => '',
  filters: {
    loanCount: element => element.querySelector('#loan-count')?.textContent
  },
  actions: {
    clickClaimReturned: async interactor => {
      await interactor.find(Button('Claim returned', { enabled: true })).click();
    }
  }
});
