import {
  interactor,
  scoped,
  collection,
  count,
  Interactor,
  property,
  clickable,
  text,
  isVisible,
} from '@bigtest/interactor';
import moment from 'moment';

import ButtonInteractor from '@folio/stripes-components/lib/Button/tests/interactor'; // eslint-disable-line
import CalloutInteractor from '@folio/stripes-components/lib/Callout/tests/interactor'; // eslint-disable-line
import CheckboxInteractor from '@folio/stripes-components/lib/Checkbox/tests/interactor';

import PatronBlockModal from './parton-blocks/modal';
import OverridePatronBlockModal from './parton-blocks/override-patron-block-modal';
import DialogInteractor from './dialog';

@interactor class BulkOverrideModal {
  static defaultScope = '#bulk-override-modal';

  dueDatePicker = scoped('[data-test-due-date-picker]');
  callNumbers = collection('[data-test-bulk-override-call-numbers]');
  columnHeaders = collection('div[role="columnheader"]');
}

@interactor class BulkRenewalModal {
  static defaultScope = '#bulk-renewal-modal';

  overrideButton = scoped('[data-test-override-button]');
  callNumbers = collection('[data-test-bulk-renew-call-numbers]');
  columnHeaders = collection('div[role="columnheader"]');
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

@interactor class BulkClaimReturnedModal {
  static defaultScope = '[data-test-bulk-claim-returned-modal]';

  additionalInfo = new Interactor('[data-test-bulk-claim-returned-additionalInfo]');
  openRequestsNumber = new Interactor('[data-test-item-request-count]');
  cancelButton = new ButtonInteractor('[data-test-bulk-cr-cancel-button]');
  confirmButton = new ButtonInteractor('[data-test-bulk-cr-confirm-button]');
  closeButton = new ButtonInteractor('[data-test-bulk-cr-close-button]');
  isConfirmButtonDisabled = property('[data-test-bulk-cr-confirm-button]', 'disabled');
}

@interactor class ErrorModal {
  static defaultScope = '[data-test-error-modal]';

  headline = text('[data-test-headline]');
  content = text('[class^="modalContent---"] p');
  closeButton = new ButtonInteractor('[data-test-close-button]');
}

@interactor class OpenLoans {
  static defaultScope = '[data-test-open-loans]';

  callout = new CalloutInteractor();
  list = scoped('[data-test-open-loans-list]');
  requests = collection('[data-test-list-requests]');
  callNumbers = collection('[data-test-list-call-numbers]');
  feeFineIncurred = new Interactor('[data-test-open-loans-list] [data-test-feefine-incurred]');
  actionDropdowns = collection('[data-test-actions-dropdown]');
  actionDropdownContainer = new Interactor('[class*=DropdownMenu---]');
  actionDropdownRequestQueue = new Interactor('[data-test-dropdown-content-request-queue]');
  actionDropdownRenewButton = new Interactor('[data-test-dropdown-content-renew-button]');
  actionDropdownChangeDueDateButton = new Interactor('[data-test-dropdown-content-change-due-date-button]');
  actionDropdownDeclareLostButton = new Interactor('[data-test-dropdown-content-declare-lost-button]');
  actionDropdownClaimReturnedButton = new Interactor('[data-test-dropdown-content-claim-returned-button]');
  actionDropdownMarkAsMissingButton = new Interactor('[data-test-dropdown-content-mark-as-missing-button]');
  requestsCount = count('[data-test-list-requests]');
  bulkRenewalModal = new BulkRenewalModal();
  bulkOverrideModal = new BulkOverrideModal();
  patronBlockModal = new PatronBlockModal();
  overridePatronBlockModal = new OverridePatronBlockModal();
  changeDueDateOverlay = new ChangeDueDateOverlay();
  bulkClaimReturnedModal = new BulkClaimReturnedModal();
  errorModal = new ErrorModal();
  declareLostDialog = new DialogInteractor('#declareLost-modal');
  claimReturnedDialog = new DialogInteractor('#claimReturned-modal');
  markAsMissingDialog = new DialogInteractor('#markAsMissing-modal');
  dueDateCalendarCellButton = new ButtonInteractor(`[data-test-date="${moment().format('MM/DD/YYYY')}"]`);
  rowButtons = collection('[data-test-open-loans-list] [data-row-inner]', ButtonInteractor);
  loanCount = text('#loan-count');

  selectAllCheckboxes = clickable('#clickable-list-column- input[type="checkbox"]');
  checkboxes = collection('#list-loanshistory [role="gridcell"]:first-child', CheckboxInteractor);
  clickRenew = clickable('#renew-all');
  clickClaimReturned = clickable('#bulk-claim-returned');

  isBulkRenewButtonDisabled = property('#renew-all', 'disabled');
  isBulkClaimReturnedDisabled = property('#bulk-claim-returned', 'disabled');
  isBulkChangeDueDateButtonDisabled = property('#change-due-date-all', 'disabled');

  itemsPresent = isVisible('#list-loanshistory [role="gridcell"]');

  whenLoaded() {
    return this.timeout(10000).when(() => this.itemsPresent);
  }
}

export default new OpenLoans({ timeout: 5000 });
