import {
  interactor,
  value,
  blurrable,
  selectable,
} from '@bigtest/interactor';

@interactor class Select {
  selectOption = selectable();
  blur = blurrable();
  value = value();

  selectAndBlur(val) {
    return this
      .selectOption(val)
      .blur();
  }
}

export default Select;
