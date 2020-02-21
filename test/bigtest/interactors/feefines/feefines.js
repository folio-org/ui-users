import {
  interactor,
  isPresent,
} from '@bigtest/interactor';

import CalloutInteractor from '@folio/stripes-components/lib/Callout/tests/interactor'; // eslint-disable-line
import ButtonInteractor from '@folio/stripes-components/lib/Button/tests/interactor'; // eslint-disable-line
import ConfirmationModalInteractor from '@folio/stripes-components/lib/ConfirmationModal/tests/interactor'; // eslint-disable-line

import ListInteractor from './list-section';

const listContainerSelector = '#editList-feefine-manual-charges';
const rowSelector = '[class*=editListRow--]';
const newManualFeeSelector = '#clickable-add-feefine-manual-charges';

@interactor class FeefinesInteractor {
  static defaultScope = '#feefines';

  whenLoaded() {
    return this.when(() => this.isLoaded).timeout(3000);
  }

  isLoaded = isPresent(rowSelector);
  list = new ListInteractor(listContainerSelector);
  callout = new CalloutInteractor();
  confirmationModal = new ConfirmationModalInteractor('#deletefeefinetype-confirmation');
  newManualFeeButton = new ButtonInteractor(newManualFeeSelector);
}

export default new FeefinesInteractor();
