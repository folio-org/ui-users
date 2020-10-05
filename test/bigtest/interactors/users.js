import {
  clickable,
  collection,
  is,
  interactor,
  Interactor,
  isPresent,
  isVisible,
  scoped,
} from '@bigtest/interactor';

@interactor class ActiveUserCheckbox {
  clickActive = clickable('#clickable-filter-active-active');
  clickInactive= clickable('#clickable-filter-active-inactive');
}

@interactor class HeaderDropdown {
  click = clickable('[data-test-pane-header-actions-button]');
}

@interactor class HeaderDropdownMenu {
  clickExportToCSV = clickable('#export-overdue-loan-report');
  exportBtnIsVisible = isVisible('#export-overdue-loan-report');
  isExportBtnPresent = isPresent('#export-overdue-loan-report');
}

@interactor class SearchFieldInteractor {
  static defaultScope = '[data-test-user-search-input]';
}

export default @interactor class UsersInteractor {
  static defaultScope = '[data-test-user-instances]';

  activeUserCheckbox = new ActiveUserCheckbox();
  headerDropdownMenu = new HeaderDropdownMenu();
  searchField = new SearchFieldInteractor();
  searchButton = new Interactor('[data-test-user-search-submit]');
  searchFocused = isPresent('[data-test-user-search-input]:focus');
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
