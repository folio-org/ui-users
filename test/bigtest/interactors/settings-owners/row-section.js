import {
  interactor,
  clickable,
  count,
  scoped,
  collection,
} from '@bigtest/interactor';

import ButtonInteractor from '@folio/stripes-components/lib/Button/tests/interactor'; // eslint-disable-line
import TextFieldInteractor from '@folio/stripes-components/lib/TextField/tests/interactor'; // eslint-disable-line
import MultiSelectInteractor from '@folio/stripes-components/lib/MultiSelection/tests/interactor'; // eslint-disable-line

import CellInteractor from './cell-section';

const textFieldSelector = '[class*=textField--]';
const cellSelector = '[class*=mclCell--]';

@interactor class RowInteractor {
  cells = collection(cellSelector, CellInteractor);
  cellCount = count(cellSelector);
  click = clickable();
  fillOwnerName = new TextFieldInteractor(`div:nth-child(1) > ${textFieldSelector}`);
  description = new TextFieldInteractor(`div:nth-child(2) > ${textFieldSelector}`);
  sp = new MultiSelectInteractor();
  editButton = scoped('[icon=edit]', ButtonInteractor);
  deleteButton = scoped('[icon=trash]', ButtonInteractor);
  saveButton = scoped('[id*=clickable-save-settings-owners-]', ButtonInteractor);
  cancelButton = scoped('[id*=clickable-cancel-settings-owners-]', ButtonInteractor);
}

export default RowInteractor;
