import {
  interactor,
  fillable,
  value,
} from '@bigtest/interactor';

export default @interactor class TextFieldInteractor {
  val = value();
  fill = fillable();

  fillAndBlur(val) {
    return this.fill(val)
      .blur();
  }
}
