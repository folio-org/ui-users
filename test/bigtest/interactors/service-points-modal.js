import {
  interactor,
  scoped,
  collection
} from '@bigtest/interactor';

import CheckboxInteractor from '@folio/stripes-components/lib/Checkbox/tests/interactor';

@interactor class ServicePointsModal {
  static defaultScope = '#service-points-modal';

  saveButton = scoped('#save-service-point-btn');
  checkBoxes = collection('[data-test-checkbox]', CheckboxInteractor);
}

export default ServicePointsModal;
