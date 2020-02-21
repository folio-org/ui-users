import {
  interactor,
  clickable,
  fillable,
  blurrable,
  triggerable,
} from '@bigtest/interactor';

@interactor class InputFieldInteractor {
  clickInput = clickable();
  fillInput = fillable();
  blurInput = blurrable();

  pressEnter = triggerable('keydown', {
    bubbles: true,
    cancelable: true,
    keyCode: 13,
    key: 'Enter',
  });

  fillAndBlur(val) {
    return this
      .clickInput()
      .timeout(5000)
      .fillInput(val)
      .timeout(5000)
      .pressEnter()
      .timeout(5000)
      .blurInput()
      .timeout(5000);
  }
}

export default InputFieldInteractor;
