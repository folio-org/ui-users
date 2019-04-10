import {
  interactor,
  clickable,
  count,
  text,
  collection,
  scoped,
  isPresent,
} from '@bigtest/interactor';

import CalloutInteractor from '@folio/stripes-components/lib/Callout/tests/interactor'; // eslint-disable-line
import ButtonInteractor from '@folio/stripes-components/lib/Button/tests/interactor'; // eslint-disable-line
import ConfirmationModalInteractor from '@folio/stripes-components/lib/ConfirmationModal/tests/interactor'; // eslint-disable-line
import TextFieldInteractor from '@folio/stripes-components/lib/TextField/tests/interactor'; // eslint-disable-line
import SelectInteractor from '@folio/stripes-components/lib/Select/tests/interactor'; // eslint-disable-line

const listContainerSelector = '#editList-feefine-manual-charges';
const rowSelector = '[class*=editListRow--]';
const cellSelector = '[class*=mclCell--]';
const textFieldSelector = '[class*=textField--]';
const selectSelector = '[class*=select--]';
const newManualFeeSelector = '#clickable-add-feefine-manual-charges';

@interactor class CellInteractor {
  content = text();
}

@interactor class RowInteractor {
  cells = collection(`${rowSelector} > div`, CellInteractor);
  cellCount = count(cellSelector);
  click = clickable();

  feeTypeField = new TextFieldInteractor(`div:nth-child(1) > ${textFieldSelector}`);
  defaultAmountField = new TextFieldInteractor(`div:nth-child(2) > ${textFieldSelector}`);
  actionNoticeField = new SelectInteractor(`div:nth-child(4) > ${selectSelector}`);
  editButton = scoped('[icon=edit]', ButtonInteractor);
  deleteButton = scoped('[icon=trash]', ButtonInteractor);
  saveButton = scoped('[id*=clickable-save-feefine-manual-charges-]', ButtonInteractor);
  cancelButton = scoped('[id*=clickable-cancel-feefine-manual-charges-]', ButtonInteractor);
}

@interactor class ListInteractor {
  rowCount = count(rowSelector);
  rows = collection(rowSelector, RowInteractor);
}

@interactor class FeefinesInteractor {
  static defaultScope = '#feefines';

  whenLoaded() {
    return this.when(() => this.isLoaded);
  }

  isLoaded = isPresent(rowSelector);
  list = new ListInteractor(listContainerSelector);
  callout = new CalloutInteractor();
  confirmationModal = new ConfirmationModalInteractor('#deletefeefinetype-confirmation');
  newManualFeeButton = new ButtonInteractor(newManualFeeSelector);
}

export default new FeefinesInteractor();
