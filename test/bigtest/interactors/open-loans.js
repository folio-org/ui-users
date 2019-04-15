import {
  interactor,
  scoped,
  collection,
  count,
} from '@bigtest/interactor';

@interactor class OpenLoans {
  static defaultScope = '[data-test-open-loans]';

  list = scoped('[data-test-open-loans-list]');
  requests = collection('[data-test-list-requests]');
  requestsCount = count('[data-test-list-requests]');
}

export default new OpenLoans();
