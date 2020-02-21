import {
  interactor,
  value,
  fillable,
} from '@bigtest/interactor';

@interactor class TextFieldInteractor {
  val = value();
  fill = fillable();

  fillAndBlur(val) {
    return this.fill(val).blur();
  }
}

export default TextFieldInteractor;
