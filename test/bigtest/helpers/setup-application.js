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
  interfaces = {},
} = {}) {
  const initialState = {
    discovery: {
      modules: {
        'mod-circulation-16.0.0-SNAPSHOT.253': 'Circulation Module',
        'mod-users-16.0.1-SNAPSHOT.121': 'users',
        'mod-feesfines-15.8.0-SNAPSHOT.73': 'feesfines',
        'mod-configuration-5.5.0-SNAPSHOT.80': 'configurations',
      },
      interfaces: {
        'circulation-event-handlers': '0.1',
        'circulation-rules-storage': '1.0',
        'circulation-rules': '1.1',
        'circulation': '9.4',
        'configuration.prefixes': '1.1',
        'configuration.reasons-for-closure': '1.0',
        'configuration.suffixes': '1.1',
        'configuration': '2.0',
        'custom-fields': '2.0',
        'feesfines': '15.3',
        'users': '15.2',
        'loan-policy-storage':'1.0',
        ...interfaces,
      },
    },
  };
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
    initialState,
  });
}
