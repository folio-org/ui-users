import {
  interactor,
  clickable,
  count,
  text,
  fillable,
  blurrable,
  triggerable,
  scoped,
  collection,
  findAll,
  value,
  selectable,
  property,
  action,
  focusable,
} from '@bigtest/interactor';

import ButtonInteractor from '@folio/stripes-components/lib/Button/tests/interactor'; // eslint-disable-line
import ModalInteractor from '@folio/stripes-components/lib/Modal/tests/interactor'; // eslint-disable-line
import SelectInteractor from '@folio/stripes-components/lib/Select/tests/interactor'; // eslint-disable-line
import PermissionsModal from './permissions-modal';
import proxyEditItemCSS from '../../../src/components/ProxyGroup/ProxyEditItem/ProxyEditItem.css';

@interactor class InputFieldInteractor {
  clickInput = clickable();
  fillInput = fillable();
  blurInput = blurrable();

  pressEnter = triggerable('keydown', {
    bubbles: true,
    cancelable: true,
    keyCode: 13,
    key: 'Enter',
  });

  fillAndBlur(val) {
    return this
      .clickInput()
      .fillInput(val)
      .pressEnter()
      .blurInput();
  }
}

@interactor class SelectFieldInteractor {
  select = selectable();
  focus = focusable();
  blur = blurrable();
  selectAndBlur(val) {
    return this
      .focus()
      .select(val)
      .blur();
  }
}

@interactor class ProxyEditInteractor {
  proxyCount = count(`[data-test="proxies"] .${proxyEditItemCSS.item}`);
  sponsorCount = count(`[data-test="sponsors"] .${proxyEditItemCSS.item}`);

  statusCount = count('[data-test-proxy-relationship-status] option');
  relationshipStatus = new SelectInteractor('[data-test-proxy-relationship-status]');
  expirationDate = new InputFieldInteractor('[name="sponsors[0].proxy.expirationDate"]');
  proxyCanRequestForSponsor = new SelectInteractor('[data-test-proxy-can-request-for-sponsor]');
  notificationsSentTo = new SelectInteractor('[data-test-proxy-notifcations-sent-to]');
}

@interactor class UserFormPage {
  // isLoaded = isPresent('[class*=paneTitleLabel---]');

  whenLoaded() {
    return this.when(() => this.isPresent).timeout(4000);
  }

  title = text('[class*=paneTitleLabel---]');
  barcodeField = new InputFieldInteractor('#adduser_barcode');
  usernameField = new InputFieldInteractor('#adduser_username');
  expirationDate = new InputFieldInteractor('#adduser_expirationdate');

  feedbackError = text('[class^="feedbackError---"]');
  cancelButton = new ButtonInteractor('[data-test-user-form-cancel-button]');
  submitButton = new ButtonInteractor('[data-test-user-form-submit-button]');
  submitButtonIsDisabled = property('[data-test-user-form-submit-button]', 'disabled');
  togglePermissionAccordionButton = scoped('#accordion-toggle-button-permissions');
  addPermissionButton = scoped('#clickable-add-permission');
  permissionsModal = new PermissionsModal();
  permissions = collection('[data-permission-name]');
  proxySection = scoped('#proxyAccordion', ProxyEditInteractor);
  errorModal = new ModalInteractor('#proxy-error-modal');
  holdShelfCheckboxIsChecked = property('[data-test-hold-shelf-checkbox]', 'checked');
  holdShelfCheckboxIsDisabled = property('[data-test-hold-shelf-checkbox]', 'disabled');
  deliveryCheckboxIsChecked = property('[data-test-delivery-checkbox]', 'checked');
  clickDeliveryCheckbox = clickable('[data-test-delivery-checkbox]');

  fulfillmentPreference = new SelectInteractor('[data-test-fulfillment-preference]');
  clickAddAddressButton = clickable('[data-test-add-address-button]');
  defaultAddressTypeValidationMessage = text('[data-test-default-delivery-address-field] [class^="feedbackError"]');
  deleteAddressType = clickable('[data-test-delete-address-button]');

  firstAddressTypeField = new SelectFieldInteractor('[name="personal.addresses[0].addressType"]');
  secondAddressTypeField = new SelectFieldInteractor('[name="personal.addresses[1].addressType"]');
  defaultAddressTypeField = new SelectFieldInteractor('[data-test-default-delivery-address-field] select');
}

export default new UserFormPage('[data-test-form-page]');
