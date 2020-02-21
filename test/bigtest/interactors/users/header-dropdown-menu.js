import {
  clickable,
  interactor,
  isVisible,
} from '@bigtest/interactor';

@interactor class HeaderDropdownMenu {
  clickExportToCSV = clickable('#export-overdue-loan-report');
  exportBtnIsVisible = isVisible('#export-overdue-loan-report');
}

export default HeaderDropdownMenu;
