import {
  interactor,
  property,
  text,
} from '@bigtest/interactor';

import ButtonInteractor from '@folio/stripes-components/lib/Button/tests/interactor';
import DatepickerInteractor from '@folio/stripes-components/lib/Datepicker/tests/interactor';
import MultiSelectionInteractor from '@folio/stripes-components/lib/MultiSelection/tests/interactor';

@interactor class RefundsReportInteractor {
  static defaultScope = '#refunds-report-modal';

  startDate = new DatepickerInteractor('[data-test-refunds-report-start-date]');
  startDateError = text('[data-test-refunds-report-start-date] [class*=feedbackError--]');
  endDate = new DatepickerInteractor('[data-test-refunds-report-end-date]');
  endDateError = text('[data-test-refunds-report-end-date] [class*=feedbackError--]');
  saveButton = new ButtonInteractor('[data-test-refunds-report-save-btn]');
  cancelButton = new ButtonInteractor('[data-test-refunds-report-cancel-btn]');
  isSaveButtonDisabled = property('[data-test-refunds-report-save-btn]', 'disabled');
  owners = new MultiSelectionInteractor('[data-test-refunds-report-owners]');
}

export default RefundsReportInteractor;
