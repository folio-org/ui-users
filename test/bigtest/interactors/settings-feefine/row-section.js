import {
  interactor,
  clickable,
  count,
  scoped,
  collection,
} from '@bigtest/interactor';

import ButtonInteractor from '@folio/stripes-components/lib/Button/tests/interactor'; // eslint-disable-line
import MultiSelectInteractor from '@folio/stripes-components/lib/MultiSelection/tests/interactor'; // eslint-disable-line

import CellInteractor from './cell-section';
import TextFieldInteractor from './text-field-section';
import SelectInteractor from './select-section';

const cellSelector = '[class*=mclCell--]';

@interactor class RowInteractor {
  cells = collection(cellSelector, CellInteractor);
  cellCount = count(cellSelector);
  click = clickable();

  textfield = collection('[class*=textField--]', TextFieldInteractor);
  select = collection('[class*=select--]', SelectInteractor);
  sp = new MultiSelectInteractor();

  editButton = scoped('[icon=edit]', ButtonInteractor);
  deleteButton = scoped('[icon=trash]', ButtonInteractor);
  saveButton = scoped('[id*=clickable-save-settings-]', ButtonInteractor);
  cancelButton = scoped('[id*=clickable-cancel-settings-]', ButtonInteractor);
}

export default RowInteractor;
