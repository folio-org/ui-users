import { createInteractor } from '@bigtest/interactor';
import Button from './Button';

export default createInteractor('actions bar')({
  selector: 'section[data-test-actions-bar]',
  filters: {
    loanCount: element => element.querySelector('#loan-count')?.textContent
  },
  actions: {
    clickButton: async (element, value) => {
      await element.find(Button(value)).click();
    },
    clickClaimReturned: async interactor => {
      await interactor.find(Button('Claim returned', { enabled: true })).click();
    }
  }
});
