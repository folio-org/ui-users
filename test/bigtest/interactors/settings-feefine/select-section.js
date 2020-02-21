import {
  interactor,
  selectable,
} from '@bigtest/interactor';

@interactor class SelectInteractor {
  selectOption = selectable('select');

  selectAndBlur(val) {
    return this
      .selectOption(val)
      .blur('select');
  }
}

export default SelectInteractor;
