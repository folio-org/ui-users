import {
  interactor,
  clickable,
} from '@bigtest/interactor';

@interactor class HeaderDropdown {
  click = clickable('[data-test-pane-header-actions-button]');
}

export default HeaderDropdown;
