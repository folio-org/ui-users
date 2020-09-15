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
    selectAll: async interactor => {
      await interactor.find(Checkbox.findByName('check-all')).click();
    },
    clickClaimReturnedForSelected: async interactor => {
      await interactor.find(ActionsBar('')).clickClaimReturned();
    }
  }
});
