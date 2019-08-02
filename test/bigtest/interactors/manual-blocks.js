import {
  interactor,
  clickable,
  text,
  isPresent,
  isVisible,
} from '@bigtest/interactor';

import TestAreaInteractor from '@folio/stripes-components/lib/TextArea/tests/interactor'; // eslint-disable-line
import DatepickerInteractor from '@folio/stripes-components/lib/Datepicker/tests/interactor'; // eslint-disable-line
import CheckboxInteractor from '@folio/stripes-components/lib/Checkbox/tests/interactor'; // eslint-disable-line
import MultiColumnListInteractor from '@folio/stripes-components/lib/MultiColumnList/tests/interactor'; // eslint-disable-line
import ConfirmationModalInteractor from '@folio/stripes-components/lib/ConfirmationModal/tests/interactor'; // eslint-disable-line
import TextFieldInteractor from '@folio/stripes-components/lib/TextField/tests/interactor'; // eslint-disable-line

@interactor class PatronBlocksSection {
  sectionIsPresent = isVisible('#accordion-toggle-button-patronBlocksSection');
  patronBlocksAreVisible = isVisible('#patron-block-mcl');
  formIsVisible = isVisible('#patron-block-form');

  whenSectionLoaded() {
    return this.when(() => this.sectionIsPresent);
  }

  whenBlocksLoaded() {
    return this.when(() => this.patronBlocksAreVisible);
  }

  whenFormLoaded() {
    return this.when(() => this.formIsVisible);
  }

  label = text('#accordion-toggle-button-patronBlocksSection > span > div > div > div:nth-child(1) > h3');

  DropdownSection = clickable('#accordion-toggle-button-patronBlocksSection');
  toggleSectionButton = clickable('[view-users-accordion-section]');
  createButton = clickable('#create-patron-block');

  patronBlockSave = clickable('#patron-block-save-close');
  patronBlockSaveButtonLabel = text('#patron-block-save-close');
  patronBlockDelete = clickable('#patron-block-delete');

  patronBlockDesc = new TestAreaInteractor('#patronBlockForm-desc');
  patronBlockStaff = new TestAreaInteractor('#patronBlockForm-staffInformation');
  patronBlockPatron = new TestAreaInteractor('#patronBlockForm-patronMessage');

  patronBlockExpirationDate = new DatepickerInteractor('#patronBlockForm-expirationDate');

  patronBlockBorrowing = new CheckboxInteractor('#patronBlockForm-borrowing');
  patronBlockRenewals = new CheckboxInteractor('#patronBlockForm-renewals');
  patronBlockRequests = new CheckboxInteractor('#patronBlockForm-requests');

  mclPatronBlock = new MultiColumnListInteractor('#patron-block-mcl');

  confirmationModal = new ConfirmationModalInteractor('#patron-block-confirmation-modal');

  // CollapseButton
  collapseButton = clickable('#accordion-toggle-button-blockInformationSection');
  collapseAllButton = clickable('#collapse-patron-block button');
  informationBlockLabelSection = text('#blockInformationSection');
  collapseAllLabelButton = text('#collapse-patron-block button');

  // section loan
  patronBlockModalCloseLoan = clickable('#patron-block-close-modal');
  patronBlockModalDetailsLoan = clickable('#patron-block-details-modal');
  DropdownSectionLoan = clickable('#accordion-toggle-button-loansSection');
  selectAllCheckbox = clickable('#clickable-list-column- input[type="checkbox"]');
  patronBlockModalRenewLoan = clickable('#renew-all');
  mclPatronBlockLoan = new MultiColumnListInteractor('#list-loanshistory');
  title = text('#paneHeadertitle-patron-block-pane-title > h2 > span');

  // view
  PatronBlockMessage = new TextFieldInteractor('#patron-block-place');
}

export default new PatronBlocksSection(5000);
