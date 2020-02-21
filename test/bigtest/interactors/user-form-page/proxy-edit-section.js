import {
  interactor,
  count,
} from '@bigtest/interactor';

import SelectInteractor from '@folio/stripes-components/lib/Select/tests/interactor'; // eslint-disable-line
import proxyEditItemCSS from '../../../../src/components/ProxyGroup/ProxyEditItem/ProxyEditItem.css';

import InputFieldInteractor from './input-field-section';

@interactor class ProxyEditInteractor {
  proxyCount = count(`[data-test="proxies"] .${proxyEditItemCSS.item}`);
  sponsorCount = count(`[data-test="sponsors"] .${proxyEditItemCSS.item}`);

  statusCount = count('[data-test-proxy-relationship-status] option');
  relationshipStatus = new SelectInteractor('[data-test-proxy-relationship-status]');
  expirationDate = new InputFieldInteractor('[name="sponsors[0].proxy.expirationDate"]');
  proxyCanRequestForSponsor = new SelectInteractor('[data-test-proxy-can-request-for-sponsor]');
  notificationsSentTo = new SelectInteractor('[data-test-proxy-notifcations-sent-to]');
}

export default ProxyEditInteractor;
