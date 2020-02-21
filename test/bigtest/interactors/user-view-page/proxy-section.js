import {
  interactor,
  count,
} from '@bigtest/interactor';

import proxyItemCSS from '../../../../src/components/ProxyGroup/ProxyItem/ProxyItem.css';

@interactor class ProxySectionInteractor {
  proxyCount = count(`[data-test="proxies"] .${proxyItemCSS.item}`);
  sponsorCount = count(`[data-test="sponsors"] .${proxyItemCSS.item}`);
}

export default ProxySectionInteractor;
