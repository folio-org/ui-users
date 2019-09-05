import {
  interactor,
  clickable,
  collection,
  count,
  text,
  isPresent,
  isVisible,
} from '@bigtest/interactor';
import ButtonInteractor from '@folio/stripes-components/lib/Button/tests/interactor'; // eslint-disable-line
import MultiColumnListInteractor from '@folio/stripes-components/lib/MultiColumnList/tests/interactor'; // eslint-disable-line
import ModalInteractor from '@folio/stripes-components/lib/Modal/tests/interactor'; // eslint-disable-line
import SearchFieldInteractor  from '@folio/stripes-components/lib/SearchField/tests/interactor'; // eslint-disable-line
import CheckboxInteractor  from '@folio/stripes-components/lib/Checkbox/tests/interactor'; // eslint-disable-line

@interactor class FeesFinesSection {
  click = clickable();
}

@interactor class CellInteractor {
  content = text();
  selectOne = clickable('input[type="checkbox"]');
  selectEllipsis = clickable('#ellipsis-button');
}

@interactor class RowInteractor {
  cells = collection('[class*=mclCell---]', CellInteractor);
  cellCount = count('[class*=mclCell---]');
  click = clickable();
}

@interactor class HeaderInteractor {
  selectAll = collection('[class*=mclHeader---]', { click: clickable() });
}

@interactor class History {
  mclViewFeesFines = new MultiColumnListInteractor('#list-accounts-history-view-feesfines');
  mclAccountActions = new MultiColumnListInteractor('#list-accountactions');
  sectionIsPresent = isPresent('#accordion-toggle-button-accountsSection');
  section = text('#accordion-toggle-button-accountsSection h3');

  title = text('[class*=paneTitleLabel---]');
  paneTitle = text('#title-test-fee-fine'['class*=paneTitleLabel---']);
  filtersTitle = text('#paneHeaderfilters-pane-pane-title [class*=paneTitleLabel---]');
  paneSub = text('#title-test-fee-fine'['class*=paneHeader']);
  outstandingMenu = text('#outstanding-balance');
  labelMenu = text('#outstanding-balance'['class*=paneHeaderButtonsArea---']);

  modalTransfer = new ModalInteractor('#transfer-modal');

  titleModalTransfer = text('#transfer-modal-label');

  openFeesFines = text('#clickable-viewcurrentaccounts');
  closedFeesFines = text('#clickable-viewclosedaccounts');
  allFeesFines = text('#clickable-viewallaccounts');

  accountActionIsPresent = isPresent('#paneHeaderpane-account-action-history-pane-title');
  ellipsisMenuIsPresent = isPresent('#ellipsis-drop-down');
  loanDetailsIsPresent = isPresent('#pane-loandetails');

  payModal = new ModalInteractor('#payment-modal');
  waiveModal = new ModalInteractor('#waive-modal');
  cancelModal = new ModalInteractor('#error-modal');
  transferModal = new ModalInteractor('#transfer-modal');

  sectionFeesFinesSection = new FeesFinesSection('#accordion-toggle-button-accountsSection')
  openAccounts = new FeesFinesSection('#clickable-viewcurrentaccounts');
  closedAccounts = new FeesFinesSection('#clickable-viewclosedaccounts');
  allAccounts = new FeesFinesSection('#clickable-viewallaccounts');

  dropDownEllipsisOptions = collection('#ellipsis-drop-down [class*=dropdownItem]');
  headerList = collection('[class*=HeaderRow---]', HeaderInteractor);
  rows = collection('#list-accounts-history-view-feesfines [class*=mclRow---]', RowInteractor);

  filterPaneVisible = isVisible('#filters-pane')
  clickfilterButton = clickable('#filter-button');
  selectAllCheckbox = clickable('#checkbox');

  closePane = new ButtonInteractor('#filters-pane [class*=paneHeader---] [class*=paneHeaderButtonsArea---] [class*=paneMenu---] [class*=iconButton---]');
  newFeeFineOpenButton = new ButtonInteractor('#open-closed-all-charge-button');
  payButton = new ButtonInteractor('#open-closed-all-pay-button');
  waiveButton = new ButtonInteractor('#open-closed-all-wave-button');
  transferButton = new ButtonInteractor('#open-closed-all-transfer-button');
  searchField = new SearchFieldInteractor('[class*=searchFieldWrap---]');
  checkList = collection('[class*=filterList---] [class*=listItem---]', CheckboxInteractor);
  col = new CheckboxInteractor('#column-item-0');
  selectColumns = new ButtonInteractor('#select-columns');

  // file AccountsHistory
  openMenu = new ButtonInteractor('#open-accounts');
  closedMenu = new ButtonInteractor('#closed-accounts');
  allMenu = new ButtonInteractor('#all-accounts');

  isLoadedOpen = isPresent('#list-accounts-history-view-feesfines [class*=mclRowContainer---] > div:nth-child(5)');
  isViewOpen = isVisible('#list-accounts-history-view-feesfines > [class*=mclScrollable---]');
  sectionIsPresent = isPresent('#accordion-toggle-button-accountsSection');

  whenSectionLoaded() {
    return this.when(() => this.sectionIsPresent);
  }

  whenLoadedOpen() {
    return this.when(() => this.isLoadedOpen);
  }

  whenVisibledOpen() {
    return this.when(() => this.isViewOpen);
  }

  isLoadedClosed = isPresent('#list-accounts-history-view-feesfines > [class*=mclRowContainer---] > div:nth-child(1)');
  isViewClosed = isVisible('#list-accounts-history-view-feesfines > [class*=mclScrollable---]');

  whenLoadedClosed() {
    return this.when(() => this.isLoadedClosed);
  }

  whenVisibledClosed() {
    return this.when(() => this.isViewClosed);
  }

  isLoadedAll = isPresent('#list-accounts-history-view-feesfines > [class*=mclRowContainer---] > div:nth-child(6)');
  isViewAll = isVisible('#list-accounts-history-view-feesfines > [class*=mclScrollable---]');

  whenLoadedAll() {
    return this.when(() => this.isLoadedAll);
  }

  whenVisibledAll() {
    return this.when(() => this.isViewAll);
  }
}
export default new History(5000);
