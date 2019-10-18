import {
  interactor,
  clickable,
  text,
} from '@bigtest/interactor';

import KeyValueInteractor from '@folio/stripes-components/lib/KeyValue/tests/interactor'; // eslint-disable-line

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
  userNameTitle = text('h2[data-test-headline]');
  userContactsEmail = new KeyValueInteractor('[data-test-email]');
}

export default new InstanceViewPage('[data-test-instance-details]');
