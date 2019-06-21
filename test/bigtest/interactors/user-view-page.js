import {
  interactor,
  clickable,
  text,
  isPresent,
} from '@bigtest/interactor';

@interactor class HeaderDropdown {
  click = clickable('button');
}

@interactor class HeaderDropdownMenu {
  clickEdit = clickable('[data-test-user-instance-edit-action]');
}

@interactor class InstanceViewPage {
  title = text('[data-test-header-title]');
  headerDropdown = new HeaderDropdown('[class*=paneHeaderCenterInner---] [class*=dropdown---]');
  headerDropdownMenu = new HeaderDropdownMenu();
  editButtonPresent = isPresent('#clickable-edituser');
  clickEditButton = clickable('#clickable-edituser');

  whenLoaded() {
    return this.when(() => this.isPresent).timeout(4000);
  }
}

export default new InstanceViewPage('[data-test-instance-details]');
