import {
  interactor,
  isPresent,
} from '@bigtest/interactor';

import CalloutInteractor from '@folio/stripes-components/lib/Callout/tests/interactor'; // eslint-disable-line
import ButtonInteractor from '@folio/stripes-components/lib/Button/tests/interactor'; // eslint-disable-line
import ConfirmationModalInteractor from '@folio/stripes-components/lib/ConfirmationModal/tests/interactor'; // eslint-disable-line

import SelectInteractor from './select-section';
import NoticeInteractor from './notice-section';
import CopyModalInteractor from './copy-modal-section';
import ListInteractor from './list-section';

const rowSelector = '[class*=editListRow--]';

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
