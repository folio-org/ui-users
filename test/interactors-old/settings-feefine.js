import {
  interactor,
  clickable,
  text,
  isPresent,
  fillable,
  selectable,
  count,
  scoped,
  collection,
} from '@bigtest/interactor';

import CalloutInteractor from '@folio/stripes-components/lib/Callout/tests/interactor'; // eslint-disable-line
import ButtonInteractor from '@folio/stripes-components/lib/Button/tests/interactor'; // eslint-disable-line
import ConfirmationModalInteractor from '@folio/stripes-components/lib/ConfirmationModal/tests/interactor'; // eslint-disable-line
// import TextFieldInteractor from '@folio/stripes-components/lib/TextField/tests/interactor'; // eslint-disable-line
import MultiSelectInteractor from '@folio/stripes-components/lib/MultiSelection/tests/interactor'; // eslint-disable-line
// import SelectInteractor from '@folio/stripes-components/lib/Select/tests/interactor'; // eslint-disable-line
import RadioButtonInteractor   from '@folio/stripes-components/lib/RadioButton/tests/interactor'; // eslint-disable-line

const rowSelector = '[class*=editListRow--]';
const cellSelector = '[class*=mclCell--]';

const SelectInteractor = interactor(class SelectInteractor {
  selectOption = selectable('select');

  selectAndBlur(val) {
    return this
      .selectOption(val)
      .blur('select');
  }
});

const TextFieldInteractor = interactor(class TextFieldInteractor {
  fill = fillable('[type="text"]');

  fillAndBlur(value) {
    return this.focus('[type="text"]')
      .fill(value)
      .blur('[type="text"]');
  }
});

const CellInteractor = interactor(class CellInteractor {
  content = text();
});

const RowInteractor = interactor(class RowInteractor {
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
});

@interactor class ListInteractor {
  rowCount = count(rowSelector);
  rows = collection(rowSelector, RowInteractor);
}

@interactor class NoticeInteractor {
  ownerChargeNotice = new SelectInteractor('#defaultChargeNoticeId');
  ownerActionNotice = new SelectInteractor('#defaultActionNoticeId');
  ownerChargeNoticeValue = text('#defaultChargeNoticeId');
  ownerActionNoticeValue = text('#defaultActionNoticeId');
  primaryButton = new ButtonInteractor('#charge-notice-primary');
  cancelNotice = new ButtonInteractor('#charge-notice-cancel');
}

@interactor class CopyModalInteractor {
  isPresent = isPresent();
  select = new SelectInteractor();
  yes = new RadioButtonInteractor('form > div > div:nth-child(1) > fieldset > div:nth-child(2)');
  no = new RadioButtonInteractor('form > div > div:nth-child(1) > fieldset > div:nth-child(3)')
  // options = collection(RadioButtonInteractor);
  buttons = collection('[class*=button---]', ButtonInteractor);
}

@interactor class FeeFineInteractor {
  isLoaded = isPresent(rowSelector);
  ownerSelect = new SelectInteractor();
  notice = new NoticeInteractor();
  copyOwnerModal = new CopyModalInteractor('[class*=modal---]');
  hideItemModal = isPresent('#hideItemInUseDialog');
  list = new ListInteractor('[id*=editList-settings-]');
  callout = new CalloutInteractor();
  confirmationModal = new ConfirmationModalInteractor('#delete-controlled-vocab-entry-confirmation');
  newItemButton = new ButtonInteractor('[id*=clickable-add-settings-]');

  whenLoaded() {
    return this.when(() => this.ownerSelect.isPresent).timeout(3000);
  }

  whenListLoaded() {
    return this.when(() => this.list.isPresent).timeout(3000);
  }
}

export default new FeeFineInteractor();
