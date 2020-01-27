import {
  interactor,
  scoped,
  collection,
  count,
  Interactor,
  property
} from '@bigtest/interactor';
import moment from 'moment';

import ButtonInteractor from '@folio/stripes-components/lib/Button/tests/interactor'; // eslint-disable-line
import CalloutInteractor from '@folio/stripes-components/lib/Callout/tests/interactor'; // eslint-disable-line

import DeclareLostDialog from './declare-lost-dialog';

@interactor class BulkOverrideModal {
  static defaultScope = '#bulk-override-modal';

  dueDatePicker = scoped('[data-test-due-date-picker]')
}

@interactor class BulkRenewalModal {
  static defaultScope = '#bulk-renewal-modal';

  overrideButton = scoped('[data-test-override-button]')
}

@interactor class ChangeDueDateOverlay {
  static defaultScope = '[data-test-change-due-date-dialog]';

  successDueDateChangeAlerts = collection('[data-test-success-due-date-change-alert]');
  dueDateCalendarButton = new ButtonInteractor('[data-test-calendar-button]');
  saveButton = new ButtonInteractor('[data-test-change-due-date-save-button]');
  cancelButton = new ButtonInteractor('[data-test-change-due-date-cancel-button]');
  requestsCount = scoped('[data-test-requests-count]');
  isSaveButtonDisabled = property('[data-test-change-due-date-save-button]', 'disabled');
}

@interactor class OpenLoans {
  static defaultScope = '[data-test-open-loans]';

  callout = new CalloutInteractor();
  list = scoped('[data-test-open-loans-list]');
  requests = collection('[data-test-list-requests]');
  actionDropdowns = collection('[data-test-actions-dropdown]');
  actionDropdownContainer = new Interactor('[class*=DropdownMenu---]');
  actionDropdownRequestQueue = new Interactor('[data-test-dropdown-content-request-queue]');
  actionDropdownRenewButton = new Interactor('[data-test-dropdown-content-renew-button]');
  actionDropdownChangeDueDateButton = new Interactor('[data-test-dropdown-content-change-due-date-button]');
  actionDropdownDeclareLostButton = new Interactor('[data-test-dropdown-content-declare-lost-button]');
  requestsCount = count('[data-test-list-requests]');
  bulkRenewalModal = new BulkRenewalModal();
  bulkOverrideModal = new BulkOverrideModal();
  changeDueDateOverlay = new ChangeDueDateOverlay();
  declareLostDialog = new DeclareLostDialog();
  dueDateCalendarCellButton = new ButtonInteractor(`[data-test-date="${moment().format('MM/DD/YYYY')}"]`);
  rowButtons = collection('[data-test-open-loans-list] button[role="row"]', ButtonInteractor);

  whenLoaded() {
    return this.when(() => this.list.isVisible);
  }
}

export default new OpenLoans({ timeout: 5000 });
