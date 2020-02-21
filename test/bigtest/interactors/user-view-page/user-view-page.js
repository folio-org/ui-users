import {
  interactor,
  clickable,
  text,
  isPresent,
  scoped,
} from '@bigtest/interactor';

import HeaderDropdown from './header-dropdown-section';
import HeaderDropdownMenu from './header-dropdown-menu-section';
import ProxySectionInteractor from './proxy-section';
import LoansSectionInteractor from './loans-section';

@interactor class InstanceViewPage {
  title = text('[data-test-header-title]');
  headerDropdown = new HeaderDropdown();
  headerDropdownMenu = new HeaderDropdownMenu();
  editButtonPresent = isPresent('#clickable-edituser');
  clickEditButton = clickable('#clickable-edituser');
  proxySection = scoped('#proxySection', ProxySectionInteractor);
  loansSection = scoped('#loansSection', LoansSectionInteractor);
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
