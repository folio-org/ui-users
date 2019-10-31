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
  findProxyButton = clickable('#clickable-plugin-find-proxy');
  findSponsorButton = clickable('#clickable-plugin-find-sponsor');
  proxyCount = count(`[data-test="proxies"] .${proxyEditItemCSS.item}`);
  sponsorCount = count(`[data-test="sponsors"] .${proxyEditItemCSS.item}`);
}

@interactor class UserFormPage {
  // isLoaded = isPresent('[class*=paneTitleLabel---]');

  whenLoaded() {
    return this.when(() => this.isPresent).timeout(4000);
  }

  title = text('[class*=paneTitleLabel---]');
  barcodeField = new InputFieldInteractor('#adduser_barcode');
  usernameField = new InputFieldInteractor('#adduser_username');
  feedbackError = text('[class^="feedbackError---"]');
  cancelButton = new ButtonInteractor('[data-test-user-form-cancel-button]');
  submitButton = new ButtonInteractor('[data-test-user-form-submit-button]');
  togglePermissionAccordionButton = scoped('#accordion-toggle-button-permissions');
  addPermissionButton = scoped('#clickable-add-permission');
  permissionsModal = new PermissionsModal();
  permissions = collection('[data-permission-name]');
  proxySection = scoped('#proxyAccordion', ProxyEditInteractor);
}

export default new UserFormPage('[data-test-form-page]');
