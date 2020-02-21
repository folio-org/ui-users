import {
  interactor,
  scoped,
  collection,
  property
} from '@bigtest/interactor';

import ButtonInteractor from '@folio/stripes-components/lib/Button/tests/interactor'; // eslint-disable-line

@interactor class ChangeDueDateOverlay {
  static defaultScope = '[data-test-change-due-date-dialog]';

  successDueDateChangeAlerts = collection('[data-test-success-due-date-change-alert]');
  dueDateCalendarButton = new ButtonInteractor('[data-test-calendar-button]');
  saveButton = new ButtonInteractor('[data-test-change-due-date-save-button]');
  cancelButton = new ButtonInteractor('[data-test-change-due-date-cancel-button]');
  requestsCount = scoped('[data-test-requests-count]');
  isSaveButtonDisabled = property('[data-test-change-due-date-save-button]', 'disabled');
}

export default ChangeDueDateOverlay;
