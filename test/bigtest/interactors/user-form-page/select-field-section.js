import {
  interactor,
  blurrable,
  selectable,
  focusable,
} from '@bigtest/interactor';

@interactor class SelectFieldInteractor {
  select = selectable();
  focus = focusable();
  blur = blurrable();
  selectAndBlur(val) {
    return this
      .focus()
      .timeout(5000)
      .select(val)
      .timeout(5000)
      .blur()
      .timeout(5000);
  }
}

export default SelectFieldInteractor;
