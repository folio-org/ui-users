import {
  interactor,
  clickable,
  text,
  isPresent,
  fillable,
  count,
  scoped,
  collection,
  isVisible,
} from '@bigtest/interactor';

import CalloutInteractor from '@folio/stripes-components/lib/Callout/tests/interactor'; // eslint-disable-line
import ButtonInteractor from '@folio/stripes-components/lib/Button/tests/interactor'; // eslint-disable-line
import ConfirmationModalInteractor from '@folio/stripes-components/lib/ConfirmationModal/tests/interactor'; // eslint-disable-line
import TextFieldInteractor from '@folio/stripes-components/lib/TextField/tests/interactor'; // eslint-disable-line
import MultiSelectInteractor from '@folio/stripes-components/lib/MultiSelection/tests/interactor'; // eslint-disable-line
const listContainerSelector = '#editList-settings-owners';
const newOwnerSelector = '#clickable-add-settings-owners';
const textFieldSelector = '[class*=textField--]';

const rowSelector = '[class*=editListRow--]';
const cellSelector = '[class*=mclCell--]';
const lastRow = '#editList-settings-owners > [class*=mclScrollable---] > div > div > div:nth-child(5)';

const CellInteractor = interactor(class CellInteractor {
    content = text();
    cellsInput = fillable('#editList-settings-owners input[type="text"]');
});

const RowInteractor = interactor(class RowInteractor {
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
});

@interactor class ListInteractor {
    rowCount = count(rowSelector);
    rows = collection(rowSelector, RowInteractor);
}

@interactor class OwnerInteractor {
    list = new ListInteractor(listContainerSelector);
    callout = new CalloutInteractor();
    confirmationModal = new ConfirmationModalInteractor('#delete-controlled-vocab-entry-confirmation');
    newOwnerButton = new ButtonInteractor(newOwnerSelector);
    isLoaded = isPresent(lastRow);
    isView = isVisible('#editList-settings-owners > [class*=mclScrollable---] > div > div');

    whenLoaded() {
      return this.when(() => this.isLoaded);
    }

    whenVisibled() {
      return this.when(() => this.isView);
    }
}

export default new OwnerInteractor();
