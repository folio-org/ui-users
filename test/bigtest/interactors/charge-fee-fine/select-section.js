import {
  count,
  interactor,
  selectable,
} from '@bigtest/interactor';


@interactor class SelectInteractor {
  selectOption = selectable();
  optionCount = count('option');

  selectAndBlur(val) {
    return this.selectOption(val).blur();
  }
}

export default SelectInteractor;
