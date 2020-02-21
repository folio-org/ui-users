import {
  interactor,
  clickable,
  isVisible,
} from '@bigtest/interactor';

@interactor class Button {
  isDisplayed = isVisible();
  click = clickable();
}

export default Button;
