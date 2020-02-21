import {
  interactor,
  scoped,
  collection,
} from '@bigtest/interactor';

@interactor class BulkRenewalModal {
  static defaultScope = '#bulk-renewal-modal';

  overrideButton = scoped('[data-test-override-button]');
  callNumbers = collection('[data-test-bulk-renew-call-numbers]');
  columnHeaders = collection('div[role="columnheader"]');
}

export default BulkRenewalModal;
