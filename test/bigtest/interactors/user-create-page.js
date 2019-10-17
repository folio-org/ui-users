import {
  interactor,
  selectable,
} from '@bigtest/interactor';

@interactor class FormSelectInteractor {
  selectPatronGroup = selectable('select[class^="selectControl---"]');
}

export default new FormSelectInteractor('form[data-test-form-page]');
