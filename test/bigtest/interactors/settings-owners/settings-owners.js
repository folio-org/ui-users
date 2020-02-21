import {
  interactor,
  isPresent,
  isVisible,
} from '@bigtest/interactor';

import CalloutInteractor from '@folio/stripes-components/lib/Callout/tests/interactor'; // eslint-disable-line
import ButtonInteractor from '@folio/stripes-components/lib/Button/tests/interactor'; // eslint-disable-line
import ConfirmationModalInteractor from '@folio/stripes-components/lib/ConfirmationModal/tests/interactor'; // eslint-disable-line

import ListInteractor from './list-section';

const listContainerSelector = '#editList-settings-owners';
const newOwnerSelector = '#clickable-add-settings-owners';
const lastRow = '#editList-settings-owners > [class*=mclScrollable---] > div > div > div:nth-child(5)';

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
