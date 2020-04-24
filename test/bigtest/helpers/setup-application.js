import setupStripesCore from '@folio/stripes-core/test/bigtest/helpers/setup-application';
import mirageOptions from '../network';

mirageOptions.serverType = 'miragejs';


export default function setupApplication({
  scenarios,
  permissions = {},
  hasAllPerms = true,
  modules,
  translations,
  currentUser,
} = {}) {
  setupStripesCore({
    mirageOptions,
    scenarios,
    permissions,
    modules,
    translations,
    stripesConfig: {
      hasAllPerms,
    },
    currentUser,
  });
}
