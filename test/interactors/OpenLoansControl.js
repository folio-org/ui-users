import { createInteractor } from '@bigtest/interactor';
import Checkbox from './Checkbox';
import ActionsBar from './ActionsBar';

export default createInteractor('open loans')({
  selector: '[data-test-open-loans]',
  filters: {
    actionsBarClaimReturnedDisabled: element => {
      return Array.from(element.querySelectorAll('[data-test-actions-bar] button').values())
        .find(btn => btn.textContent === 'Claim returned').disabled;
    }
  },
  actions: {
    clickClaimReturnedForSelected: async interactor => {
      await interactor.find(ActionsBar()).clickClaimReturned();
    },
    selectAll: async interactor => {
      await interactor.find(Checkbox({ name: 'check-all' })).click();
    }
  }
});
