import {
  collection,
  clickable,
  interactor,
  isPresent,
  count,
  text,
  fillable,
  selectable,
  scoped,
} from '@bigtest/interactor';

import CalloutInteractor from '@folio/stripes-components/lib/Callout/tests/interactor'; // eslint-disable-line
import ButtonInteractor from '@folio/stripes-components/lib/Button/tests/interactor'; // eslint-disable-line
import ConfirmationModalInteractor from '@folio/stripes-components/lib/ConfirmationModal/tests/interactor'; // eslint-disable-line
import TextFieldInteractor from '@folio/stripes-components/lib/TextField/tests/interactor'; // eslint-disable-line

const listContainerSelector = '#editList-settings-transfers';
const rowSelector = '[class*=editListRow--]';
const cellSelector = '[class*=mclCell--]';
const textFieldSelector = '[class*=textField--]';
const newTransfersSelector = '#clickable-add-settings-transfers';

const CellInteractor = interactor(class CellInteractor {
        content = text();
});

const RowInteractor = interactor(class RowInteractor {
      cells = collection(`${rowSelector} > div`, CellInteractor);
      cellCount = count(cellSelector);
      click = clickable();
      fillTransferName = new TextFieldInteractor(`div:nth-child(1) > ${textFieldSelector}`);
      description = new TextFieldInteractor(`div:nth-child(2) > ${textFieldSelector}`);
      editButton = scoped('[icon=edit]', ButtonInteractor);
      deleteButton = scoped('[icon=trash]', ButtonInteractor);
      saveButton = scoped('[id*=clickable-save-settings-transfers-]', ButtonInteractor);
      cancelButton = scoped('[id*=clickable-cancel-settings-transfers-]', ButtonInteractor);
});

    @interactor class ListInteractor {
      rowCount = count(rowSelector);
      rows = collection(rowSelector, RowInteractor);
    }

    @interactor class TransfersInteractor {
      static defaultScope = '#transfers';
      list = new ListInteractor(listContainerSelector);
      callout = new CalloutInteractor();
      confirmationModal = new ConfirmationModalInteractor('#confirm-delete-transfer');
      newTransfersButton = new ButtonInteractor(newTransfersSelector);
      fillTransferMethod = fillable('#editList-settings-transfers div:nth-child(1) input[type="text"]');
      activeSelector = selectable('#select-owner');

      whenLoaded() {
        return this.when(() => this.isLoaded);
      }

      isLoaded = isPresent(rowSelector);
    }

export default new TransfersInteractor();
