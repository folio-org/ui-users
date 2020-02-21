import {
  interactor,
  scoped,
  collection,
  count,
  Interactor,
  clickable,
} from '@bigtest/interactor';
import moment from 'moment';

import ButtonInteractor from '@folio/stripes-components/lib/Button/tests/interactor'; // eslint-disable-line
import CalloutInteractor from '@folio/stripes-components/lib/Callout/tests/interactor'; // eslint-disable-line

import DeclareLostDialog from '../declare-lost-dialog';
import ClaimReturnedDialog from '../claim-returned-dialog';

import BulkOverrideModal from './bulk-override-modal';
import BulkRenewalModal from './bulk-renewal-modal';
import ChangeDueDateOverlay from './change-due-date-overlay';

@interactor class OpenLoans {
  static defaultScope = '[data-test-open-loans]';

  callout = new CalloutInteractor();
  list = scoped('[data-test-open-loans-list]');
  requests = collection('[data-test-list-requests]');
  callNumbers = collection('[data-test-list-call-numbers]');
  actionDropdowns = collection('[data-test-actions-dropdown]');
  actionDropdownContainer = new Interactor('[class*=DropdownMenu---]');
  actionDropdownRequestQueue = new Interactor('[data-test-dropdown-content-request-queue]');
  actionDropdownRenewButton = new Interactor('[data-test-dropdown-content-renew-button]');
  actionDropdownChangeDueDateButton = new Interactor('[data-test-dropdown-content-change-due-date-button]');
  actionDropdownDeclareLostButton = new Interactor('[data-test-dropdown-content-declare-lost-button]');
  actionDropdownClaimReturnedButton = new Interactor('[data-test-dropdown-content-claim-returned-button]');
  requestsCount = count('[data-test-list-requests]');
  bulkRenewalModal = new BulkRenewalModal();
  bulkOverrideModal = new BulkOverrideModal();
  changeDueDateOverlay = new ChangeDueDateOverlay();
  declareLostDialog = new DeclareLostDialog();
  claimReturnedDialog = new ClaimReturnedDialog();
  dueDateCalendarCellButton = new ButtonInteractor(`[data-test-date="${moment().format('MM/DD/YYYY')}"]`);
  rowButtons = collection('[data-test-open-loans-list] button[role="row"]', ButtonInteractor);

  selectAllCheckboxes = clickable('#clickable-list-column- input[type="checkbox"]');
  clickRenew = clickable('#renew-all');

  whenLoaded() {
    return this.when(() => this.list.isVisible);
  }
}

export default new OpenLoans({ timeout: 5000 });
