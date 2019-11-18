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
  togglePermissionAccordionButton = scoped('#accordion-toggle-button-permissions');
  addPermissionButton = scoped('#clickable-add-permission');
  permissionsModal = new PermissionsModal();
  permissions = collection('[data-permission-name]');
  proxySection = scoped('#proxyAccordion', ProxyEditInteractor);
  errorModal = new ModalInteractor('#proxy-error-modal');
}

export default new UserFormPage('[data-test-form-page]');
