import {
  interactor,
  text,
} from '@bigtest/interactor';

import MultiColumnListInteractor from '@folio/stripes-components/lib/MultiColumnList/tests/interactor'; // eslint-disable-line


@interactor class LoanDetails404 {
  static defaultScope = '#pane-loandetails-404-content';
  message = text();
}

export default new LoanDetails404({ timeout: 5000 });
