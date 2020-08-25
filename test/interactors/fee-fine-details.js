import {
  interactor,
  scoped,
  clickable,
} from '@bigtest/interactor';

import KeyValue from './KeyValue';

@interactor class FeeFineDetails {
  static defaultScope = '[data-test-fee-fine-details]';

  overduePolicy = scoped('[data-test-overdue-policy] div', KeyValue);
  overduePolicyClick = clickable('[data-test-overdue-policy] a');
  lostItemPolicy = scoped('[data-test-lost-item-policy] div', KeyValue);
  lostItemPolicyClick = clickable('[data-test-lost-item-policy] a');
  instanceAndType = scoped('[data-test-instance] div', KeyValue);
  contributors = scoped('[data-test-contributors] div', KeyValue);

  whenLoaded() {
    return this.when(() => this.isPresent).timeout(5000);
  }
}

export default new FeeFineDetails({ timeout: 5000 });
