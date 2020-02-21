import {
  interactor,
  clickable,
} from '@bigtest/interactor';

@interactor class HeaderDropdownMenu {
  clickEdit = clickable('[data-test-user-instance-edit-action]');
}

export default HeaderDropdownMenu;
