import {
  interactor,
  clickable,
  count,
  text,
  collection,
  scoped,
  isPresent,
  isVisible
} from '@bigtest/interactor';

import ButtonInteractor from '@folio/stripes-components/lib/Button/tests/interactor'; // eslint-disable-line
import MultiColumnListInteractor from '@folio/stripes-components/lib/MultiColumnList/tests/interactor'; // eslint-disable-line
import ConfirmationModalInteractor from '@folio/stripes-components/lib/ConfirmationModal/tests/interactor'; // eslint-disable-line
import TextFieldInteractor from '@folio/stripes-components/lib/TextField/tests/interactor'; // eslint-disable-line
import TextAreaInteractor from '@folio/stripes-components/lib/TextArea/tests/interactor'; // eslint-disable-line
import SelectInteractor from '@folio/stripes-components/lib/Select/tests/interactor'; // eslint-disable-line


@interactor class CellInteractor {
  content = text();
  selectOneWarning = clickable('input[type="checkbox"]');
}

@interactor class RowInteractor {
  cells = collection('[class*=mclCell---]', CellInteractor);
  cellCount = count('[class*=mclCell---]');
  click = clickable();
}

@interactor class CheckboxInteractor {
  click = clickable('input[type="checkbox"]');
}

@interactor class HeaderInteractor {
  selectAll = collection('[class*=mclHeader---]', { click: clickable() });
}

@interactor class TransferInteractor {
  listaHeader = collection('[class*=HeaderRow---]', HeaderInteractor);
  checkList = collection('[class*=mclRow---]', CheckboxInteractor);
  rows = collection('#warning-mcl [class*=mclRow---]', RowInteractor);

  transferButton = clickable('#open-closed-all-transfer-button');
  cancel = scoped('#cancel-button', ButtonInteractor);
  submit = scoped('#submit-button', ButtonInteractor);
  amount = new TextFieldInteractor('[class*=formControl---]');
  transferAccount = new SelectInteractor('[class*=selectWrap---]')
  comment = new TextAreaInteractor('[class*=textArea---]');
  notify = new CheckboxInteractor('[class*=checkbox---]')


  confirmation = new ConfirmationModalInteractor('[id*=confirmation-]');
  mclAll = new MultiColumnListInteractor('#list-accounts-history-view-feesfines');
  mclOpen = new MultiColumnListInteractor('#list-accounts-history-view-feesfines');
  mclWarning = new MultiColumnListInteractor('#warning-mcl');
  warningTransferCancel = clickable('#warningTransferCancel');
  warningTransferContinue = clickable('#warningTransferContinue');

  confirmationModal = new ConfirmationModalInteractor();


  selectCheckbox = clickable('#checkbox');

  isLoaded = isPresent('#list-accounts-history-view-feesfines [class*=mclRowContainer---] > div:nth-child(5)');
  isView = isVisible('#list-accounts-history-view-feesfines [class*=mclScrollable---]');
  // File
  openAccounts = clickable('#open-accounts');
  closedAccounts = clickable('#closed-accounts');
  allAccounts = clickable('#all-accounts');

  selectCheckboxWarning = clickable('#warning-checkbox');

  whenLoaded() {
    return this.when(() => this.isLoaded);
  }

  whenVisibled() {
    return this.when(() => this.isView);
  }
}

export default new TransferInteractor();
