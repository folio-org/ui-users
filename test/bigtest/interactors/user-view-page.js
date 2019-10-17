import {
  interactor,
  clickable,
  text,

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
  userNameTitle = text('h2[class^="headline--"]');
  userContactsEmail = text('#contactInfoSection div[class^="content---"] div[class^="row---"]:first-child div[class^="kvValue---"]');
}

export default new InstanceViewPage('[data-test-instance-details]');
