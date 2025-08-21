/* eslint-disable import/no-extraneous-dependencies */
import stripesComponentsTranslations from '@folio/stripes-components/translations/stripes-components/en';
import stripesSmartComponentsTranslations from '@folio/stripes-smart-components/translations/stripes-smart-components/en';
import stripesCoreTranslations from '@folio/stripes-core/translations/stripes-core/en';
import translations from '../../../translations/ui-users/en';

const translationsProperties = [
  {
    prefix: 'ui-users',
    translations,
  },
  {
    prefix: 'stripes-components',
    translations: stripesComponentsTranslations,
  },
  {
    prefix: 'stripes-smart-components',
    translations: stripesSmartComponentsTranslations,
  },
  {
    prefix: 'stripes-core',
    translations: stripesCoreTranslations,
  },
];

export default translationsProperties;
