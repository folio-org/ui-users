import {
  interactor,
  scoped,
  collection,
  count,
  Interactor,
} from '@bigtest/interactor';

@interactor class BulkOverrideModal {
  static defaultScope = '#bulk-override-modal';

  dueDatePicker = scoped('[data-test-due-date-picker]')
}

@interactor class BulkRenewalModal {
  static defaultScope = '#bulk-renewal-modal';

  overrideButton = scoped('[data-test-override-button]')
}

@interactor class OpenLoans {
  static defaultScope = '[data-test-open-loans]';

  list = scoped('[data-test-open-loans-list]');
  requests = collection('[data-test-list-requests]');
  actionDropdowns = collection('[data-test-actions-dropdown]');
  actionDropdownRequestQueue = new Interactor('[data-test-dropdown-content-request-queue]');
  actionDropdownRenewButton = new Interactor('[data-test-dropdown-content-renew-button]');
  requestsCount = count('[data-test-list-requests]');

  bulkRenewalModal = new BulkRenewalModal();
  bulkOverrideModal = new BulkOverrideModal();
}

export default new OpenLoans(5000);
