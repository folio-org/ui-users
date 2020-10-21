import {
  interactor,
  clickable,
  text,
  isPresent,
  scoped,
  count,
  collection,
  ButtonInteractor,
} from '@bigtest/interactor';

import proxyItemCSS from '../../../src/components/ProxyGroup/ProxyItem/ProxyItem.css';

@interactor class AccordionSection {
  keyValues = collection('[data-test-kv-value]');
  click = clickable();
}

@interactor class ProxySectionInteractor {
  proxyCount = count(`[data-test="proxies"] .${proxyItemCSS.item}`);
  sponsorCount = count(`[data-test="sponsors"] .${proxyItemCSS.item}`);
}

@interactor class LoansSectionInteractor {
  accordionButton = scoped('#accordion-toggle-button-loansSection', ButtonInteractor);
  openLoans = scoped('#clickable-viewcurrentloans', ButtonInteractor);
  closedLoans = scoped('#clickable-viewclosedloans', ButtonInteractor);
  claimedReturnedCount = text('#claimed-returned-count');

  whenLoaded() {
    return this.when(() => this.isPresent).timeout(5000);
  }
}

@interactor class CustomFieldsSectionInteractor {
  accordionButton = scoped('#accordion-toggle-button-customfields', ButtonInteractor);
  label = text('[class*="labelArea---"]');
}

@interactor class InstanceViewPage {
  title = text('[data-test-header-title]');
  // headerDropdown = new HeaderDropdown();
  // headerDropdownMenu = new HeaderDropdownMenu();
  editButtonPresent = isPresent('#clickable-edituser');
  clickEditButton = clickable('#clickable-edituser');
  proxySection = scoped('#proxySection', ProxySectionInteractor);
  loansSection = scoped('#loansSection', LoansSectionInteractor);
  holdShelf = text('[data-test-hold-shelf]');
  delivery = text('[data-test-delivery]');
  fulfillmentPreference = text('[data-test-fulfillment-preference]');
  defaultPickupServicePoint = text('[data-test-default-pickup-service-point]');
  defaultDeliveryAddress = text('[data-test-default-delivery-address]');
  customFieldsSection = scoped('#customFields', CustomFieldsSectionInteractor);
  userInfo = new AccordionSection('#userInformationSection');
  contactInfo = new AccordionSection('#contactInfoSection');
  departmentName = text('[data-test-department-name]');
  actionMenuButton = scoped('[data-test-actions-menu]');

  whenLoaded() {
    return this.when(() => this.isPresent).timeout(5000);
  }
}

export default new InstanceViewPage('[data-test-instance-details]');
