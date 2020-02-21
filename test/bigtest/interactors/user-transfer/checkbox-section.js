import {
  interactor,
  clickable,
} from '@bigtest/interactor';

@interactor class CheckboxInteractor {
  click = clickable('input[type="checkbox"]');
}

export default CheckboxInteractor;
