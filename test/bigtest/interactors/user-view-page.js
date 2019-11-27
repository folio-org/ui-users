import {
  interactor,
  clickable,
  text,
  isPresent,
  scoped,
  count,
} from '@bigtest/interactor';

import proxyItemCSS from '../../../src/components/ProxyGroup/ProxyItem/ProxyItem.css';

@interactor class HeaderDropdown {
  click = clickable('button');
}

@interactor class HeaderDropdownMenu {
  clickEdit = clickable('[data-test-user-instance-edit-action]');
}

@interactor class ProxySectionInteractor {
  proxyCount = count(`[data-test="proxies"] .${proxyItemCSS.item}`);
  sponsorCount = count(`[data-test="sponsors"] .${proxyItemCSS.item}`);
}

@interactor class InstanceViewPage {
  title = text('[data-test-header-title]');
  headerDropdown = new HeaderDropdown('[class*=paneHeaderCenterInner---] [class*=dropdown---]');
  headerDropdownMenu = new HeaderDropdownMenu();
  editButtonPresent = isPresent('#clickable-edituser');
  clickEditButton = clickable('#clickable-edituser');
  proxySection = scoped('#proxySection', ProxySectionInteractor);
  holdShelf = text('[data-test-hold-shelf]');
  delivery = text('[data-test-delivery]');
  fulfillmentPreference = text('[data-test-fulfillment-preference]');
  defaultPickupServicePoint = text('[data-test-default-pickup-service-point]');
  defaultDeliveryAddress = text('[data-test-default-delivery-address]');
  whenLoaded() {
    return this.when(() => this.isPresent).timeout(5000);
  }
}

export default new InstanceViewPage('[data-test-instance-details]');
