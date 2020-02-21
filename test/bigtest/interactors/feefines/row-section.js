import {
  interactor,
  clickable,
  count,
  collection,
  scoped,
} from '@bigtest/interactor';

import ButtonInteractor from '@folio/stripes-components/lib/Button/tests/interactor'; // eslint-disable-line
import TextFieldInteractor from '@folio/stripes-components/lib/TextField/tests/interactor'; // eslint-disable-line
import SelectInteractor from '@folio/stripes-components/lib/Select/tests/interactor'; // eslint-disable-line

import CellInteractor from './cell-section';

const rowSelector = '[class*=editListRow--]';
const cellSelector = '[class*=mclCell--]';
const textFieldSelector = '[class*=textField--]';
const selectSelector = '[class*=select--]';

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

export default RowInteractor;
