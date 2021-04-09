import {
  clickable,
  collection,
  is,
  interactor,
  Interactor,
  isPresent,
  isVisible,
  scoped,
  selectable,
} from '@bigtest/interactor';

import CalloutInteractor from '@folio/stripes-components/lib/Callout/tests/interactor'; // eslint-disable-line
import MultiSelectInteractor from '@folio/stripes-components/lib/MultiSelection/tests/interactor';
import RefundsReportModal from './refunds-report-modal';

@interactor class ActiveUserCheckbox {
  clickActive = clickable('#clickable-filter-active-active');
  clickInactive= clickable('#clickable-filter-active-inactive');
}

@interactor class DepartmentsFilter {
  multiSelect = new MultiSelectInteractor('#departments-filter');
  isAccordionPresent = isPresent('#users-filter-accordion-departments');
  whenLoaded() {
    return this.when(() => isPresent('#departments-filter'));
  }
}

@interactor class HeaderDropdown {
  click = clickable('[data-test-pane-header-actions-button]');
}

@interactor class HeaderDropdownMenu {
  clickExportToCSV = clickable('#export-overdue-loan-report');
  exportBtnIsVisible = isVisible('#export-overdue-loan-report');
  isExportBtnPresent = isPresent('#export-overdue-loan-report');
  isCashDrawerReportBtnPresent = isPresent('#cash-drawer-report');
  isFinancialTransactionReportBtnPresent = isPresent('#financial-transaction-report');
  clickRefundsReportCSV = clickable('#export-refunds-report');
  isRefundReportBtnVisible = isVisible('#export-refunds-report');
  isRefundsReportButtonPresent = isPresent('#export-refunds-report');
  columnCheckbox = function columnCheckbox(key) {
    return new Interactor(`[data-test-column-manager-checkbox="${key}"]`);
  }
}

@interactor class SearchFieldInteractor {
  static defaultScope = '[data-test-user-search-input]';
}

export default @interactor class UsersInteractor {
  static defaultScope = '[data-test-user-instances]';

  refundsReportModal = new RefundsReportModal();
  isRefundsReportModalPresent = isPresent('#refunds-report-modal');
  activeUserCheckbox = new ActiveUserCheckbox();
  departmentsFilter = new DepartmentsFilter();
  headerDropdownMenu = new HeaderDropdownMenu();
  searchField = new SearchFieldInteractor();
  searchButton = new Interactor('[data-test-user-search-submit]');
  searchFocused = isPresent('[data-test-user-search-input]:focus');
  chooseSearchOption = selectable('#input-user-search-qindex');
  paneHeaderFocused = is('#users-search-results-pane [class*=paneHeader---]', ':focus');
  patronGroupsPresent = isPresent('#clickable-filter-pg-faculty');
  instancePresent = isPresent('[data-test-instance-details]');
  instancesPresent = isPresent('[role=rowgroup] [role=row]');
  headerDropdown = new HeaderDropdown();
  clickFacultyCheckbox = clickable('#clickable-filter-pg-faculty');
  clickGraduateCheckbox = clickable('#clickable-filter-pg-graduate');
  clickStaffCheckbox = clickable('#clickable-filter-pg-staff');
  clickUndergradCheckbox = clickable('#clickable-filter-pg-undergrad');
  clickCreateUserButton = clickable('#clickable-newuser');
  instance = scoped('[data-test-instance-details]');
  instances = collection('[role=rowgroup] [data-row-inner]');
  clearStatusFilter = clickable('[data-test-clear-button]');
  column = function column(key) {
    return new Interactor(`#list-column-${key}`);
  }

  callout = new CalloutInteractor();

  whenInstanceLoaded() {
    return this.when(() => this.instancePresent).timeout(5000);
  }

  whenInstancesLoaded() {
    return this.when(() => this.instancesPresent).timeout(5000);
  }

  whenLoaded() {
    return this.when(() => this.patronGroupsPresent).timeout(5000);
  }
}
