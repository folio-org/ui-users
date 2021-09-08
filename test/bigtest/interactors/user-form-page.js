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
  selectable,
  property,
  focusable,
  isPresent,
} from '@bigtest/interactor';

import ButtonInteractor from '@folio/stripes-components/lib/Button/tests/interactor'; // eslint-disable-line
import RepeatableFieldInteractor from '@folio/stripes-components/lib/RepeatableField/tests/interactor';
import ModalInteractor from '@folio/stripes-components/lib/Modal/tests/interactor'; // eslint-disable-line
import SelectInteractor from '@folio/stripes-components/lib/Select/tests/interactor'; // eslint-disable-line
import PermissionsModal from './permissions-modal';
import ServicePointsModal from './service-points-modal';
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
      .timeout(5000)
      .fillInput(val)
      .timeout(5000)
      .pressEnter()
      .timeout(5000)
      .blurInput()
      .timeout(5000);
  }
}

@interactor class SelectFieldInteractor {
  select = selectable();
  focus = focusable();
  blur = blurrable();
  selectAndBlur(val) {
    return this
      .focus()
      .timeout(5000)
      .select(val)
      .timeout(5000)
      .blur()
      .timeout(5000);
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

@interactor class CustomFieldsSectionInteractor {
  fields = collection('[data-test-record-edit-custom-field]', {
    input: scoped('[type="text"]', {
      fillInput: fillable(),
      blurInput: blurrable(),

      fillAndBlur(val) {
        return this
          .fillInput(val)
          .blurInput();
      }
    }),
    popoverIsPresent: isPresent('[class^=infoPopover---]'),
    validationMessage: text('[class^=feedbackError---]'),
  });

  label = text('[class*="labelArea---"]');
}

@interactor class ServicePointInteractor {
  deleteServicePoint = clickable('[id*=clickable-remove-service-point-]')
}

@interactor class UserFormPage {
  // isLoaded = isPresent('[class*=paneTitleLabel---]');

  whenLoaded() {
    return this.when(() => this.isPresent).timeout(4000);
  }

  title = text('[class*=paneTitleLabel---]');
  barcodeField = new InputFieldInteractor('#adduser_barcode');
  usernameField = new InputFieldInteractor('#adduser_username');
  emailField = new InputFieldInteractor('#adduser_email');
  isUsernameFieldRequired = property('#adduser_username', 'required');
  resetPasswordLink = scoped('[class*=resetPasswordButton]');
  expirationDate = new InputFieldInteractor('#adduser_expirationdate');
  clearExpirationDate = clickable('#datepicker-clear-button-adduser_expirationdate');

  feedbackError = text('[class^="feedbackError---"]');
  cancelButton = new ButtonInteractor('[data-test-user-form-cancel-button]');
  submitButton = new ButtonInteractor('[data-test-user-form-submit-button]');
  submitButtonIsDisabled = property('[data-test-user-form-submit-button]', 'disabled');
  actionMenuButton = new ButtonInteractor('[data-test-actions-menu]');
  actionMenuCreateRequestButton = scoped('[data-test-actions-menu-create-request]');
  actionMenuCreateFeeFinesButton = scoped('[data-test-actions-menu-create-feesfines]');
  actionMenuCreatePatronBlocksButton = scoped('[data-test-actions-menu-create-patronblocks]');

  toggleSPAccordionButton = scoped('#accordion-toggle-button-servicePoints');
  addServicePointButton = scoped('#add-service-point-btn');
  servicePoints = collection('[data-test-service-point]', ServicePointInteractor);
  servicePointsModal = new ServicePointsModal();

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
  statusField = new SelectFieldInteractor('#useractive');
  patronGroupField = new SelectFieldInteractor('#adduser_group');
  recalculateExpirationdateModal = new ModalInteractor('#recalculate_expirationdate_modal');
  recalculateExpirationdateButton = scoped('#recalculate-expirationDate-btn');
  expirationdateModalCancelButton = new ButtonInteractor('#expirationDate-modal-recalculate-btn');
  expirationdateModalRecalculateButton = new ButtonInteractor('#expirationDate-modal-cancel-btn');
  usersExpirationdateField = scoped('#adduser_expirationdate');
  userWillReactivateMessage = scoped('#saving-will-reactivate-user');
  customFieldsSection = scoped('#customFields', CustomFieldsSectionInteractor);
  departmentName = new RepeatableFieldInteractor('#department-name');
}

export default new UserFormPage('[data-test-form-page]');
