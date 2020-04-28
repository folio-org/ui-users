import {
  interactor,
  text,
  property,
  collection,
  scoped,
} from '@bigtest/interactor';

import CalloutInteractor from '@folio/stripes-components/lib/Callout/tests/interactor';

import TextFieldInteractor from './text-field';

@interactor class SettingsLimitsForm {
  static defaultScope = ('[data-test-limits-wrapper]');

  form = scoped('[data-test-limits-form]');
  formHeader = text('[class*=paneTitleLabel]');
  limitField = collection('[data-test-limit-field]', TextFieldInteractor);
  limitFieldLabel = collection('[data-test-limit-label] b');
  errorMessage = scoped('[class*=feedbackError]');
  saveButton = scoped('[data-test-limits-save-button]');
  isSaveButtonDisabled = property('[data-test-limits-save-button]', 'disabled');
  calloutMessage = new CalloutInteractor();

  whenLoaded() {
    return this.when(() => this.isPresent).timeout(2000);
  }
}

export default new SettingsLimitsForm({ timeout: 2000 });
