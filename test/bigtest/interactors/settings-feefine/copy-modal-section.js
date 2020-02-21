import {
  interactor,
  isPresent,
  collection,
} from '@bigtest/interactor';

import ButtonInteractor from '@folio/stripes-components/lib/Button/tests/interactor'; // eslint-disable-line
import RadioButtonInteractor   from '@folio/stripes-components/lib/RadioButton/tests/interactor'; // eslint-disable-line

import SelectInteractor from './select-section';

@interactor class CopyModalInteractor {
  isPresent = isPresent();
  select = new SelectInteractor();
  yes = new RadioButtonInteractor('form > div > div:nth-child(1) > fieldset > div:nth-child(2)');
  no = new RadioButtonInteractor('form > div > div:nth-child(1) > fieldset > div:nth-child(3)')
  // options = collection(RadioButtonInteractor);
  buttons = collection('[class*=button---]', ButtonInteractor);
}

export default CopyModalInteractor;
