import {
  interactor,
  fillable,
} from '@bigtest/interactor';

@interactor class TextFieldInteractor {
  fill = fillable('[type="text"]');

  fillAndBlur(value) {
    return this.focus('[type="text"]')
      .fill(value)
      .blur('[type="text"]');
  }
}

export default TextFieldInteractor;
