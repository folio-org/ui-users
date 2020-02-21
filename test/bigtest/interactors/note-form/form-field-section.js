import {
  interactor,
  fillable,
  value,
  blurrable,
  focusable,
} from '@bigtest/interactor';

@interactor class FormField {
  enterText(string) {
    return this
      .focus()
      .fill(string)
      .blur();
  }

  focus = focusable();
  blur = blurrable();
  fill = fillable();
  value = value();
}

export default FormField;
