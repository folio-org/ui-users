import {
  interactor,
  scoped,
  collection,
  count,
  Interactor,
} from '@bigtest/interactor';

@interactor class OpenLoans {
  static defaultScope = '[data-test-open-loans]';

  list = scoped('[data-test-open-loans-list]');
  requests = collection('[data-test-list-requests]');
  actionDropdowns = collection('[data-test-actions-dropdown]');
  actionDropdownRequestQueue = new Interactor('[data-test-dropdown-content-request-queue]');
  requestsCount = count('[data-test-list-requests]');
}

export default new OpenLoans();
