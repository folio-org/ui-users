import {
  clickable,
  interactor,
} from '@bigtest/interactor';

@interactor class ActiveUserCheckbox {
  clickActive = clickable('#clickable-filter-active-active');
  clickInactive= clickable('#clickable-filter-active-inactive');
}

export default ActiveUserCheckbox;
