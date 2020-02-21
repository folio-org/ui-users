import {
  interactor,
  clickable,
  is,
} from '@bigtest/interactor';

@interactor class Button {
  isDisabled = is('[disabled]');
  click = clickable();
}

export default Button;
