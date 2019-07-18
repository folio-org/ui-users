import {
  interactor,
  clickable,
  text,
  isPresent,
  fillable,
  count,
  scoped,
  selectable,
  collection,
} from '@bigtest/interactor';

import CalloutInteractor from '@folio/stripes-components/lib/Callout/tests/interactor'; // eslint-disable-line
import ButtonInteractor from '@folio/stripes-components/lib/Button/tests/interactor'; // eslint-disable-line
import ConfirmationModalInteractor from '@folio/stripes-components/lib/ConfirmationModal/tests/interactor'; // eslint-disable-line
import TextFieldInteractor from '@folio/stripes-components/lib/TextField/tests/interactor'; // eslint-disable-line
import MultiSelectInteractor from '@folio/stripes-components/lib/MultiSelection/tests/interactor'; // eslint-disable-line

const listContainerSelector = '[id*=editList-settings-]';
const newButtonSelector = '[id*=clickable-add-settings-]';
const textFieldSelector = '[class*=textField--]';
const rowSelector = '[class*=editListRow--]';
const cellSelector = '[class*=mclCell--]';


const CellInteractor = interactor(class CellInteractor {
        content = text();
});

const RowInteractor = interactor(class RowInteractor {
      cells = collection(`${rowSelector} > div`, CellInteractor);
      cellCount = count(cellSelector);
      click = clickable();
      fillTransferName = new TextFieldInteractor(`div:nth-child(1) > ${textFieldSelector}`);
      description = new TextFieldInteractor(`div:nth-child(2) > ${textFieldSelector}`);
      sp = new MultiSelectInteractor();
      editButton = scoped('[icon=edit]', ButtonInteractor);
      deleteButton = scoped('[icon=trash]', ButtonInteractor);
      saveButton = scoped('[id*=clickable-save-settings-]', ButtonInteractor);
      cancelButton = scoped('[id*=clickable-cancel-settings-]', ButtonInteractor);
});

    @interactor class ListInteractor {
      rowCount = count(rowSelector);
      rows = collection(rowSelector, RowInteractor);
    }

    @interactor class SetttingsInteractor {
      list = new ListInteractor(listContainerSelector);
      callout = new CalloutInteractor();
      confirmationModal = new ConfirmationModalInteractor('#delete-controlled-vocab-entry-confirmation');
      newButton = new ButtonInteractor(newButtonSelector);
      fillTransferMethod = fillable('[id*=editList-settings-] div:nth-child(1) input[type="text"]');
      activeSelector = selectable('#select-owner');

      whenLoaded() {
        return this.when(() => this.isLoaded);
      }

      isLoaded = isPresent(rowSelector);
    }

export default new SetttingsInteractor();
