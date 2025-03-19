import { useMemo } from 'react';
import { Field } from 'react-final-form';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import {
  Col,
  MessageBanner,
  Row,
  Select,
} from '@folio/stripes/components';
import { useStripes } from '@folio/stripes/core';
import { ConfigManager } from '@folio/stripes/smart-components';

import {
  BARCODE_SETTING,
  NUMBER_GENERATOR_OPTIONS,
  NUMBER_GENERATOR_SETTINGS_KEY,
  NUMBER_GENERATOR_SETTINGS_SCOPE,
  SERVICE_INTERACTION_LINK,
  SERVICE_INTERACTION_NUMBER_GENERATOR_SEQUENCES_LINK,
} from './constants';

const NumberGeneratorSettings = () => {
  const stripes = useStripes();
  const intl = useIntl();
  const ConnectedConfigManager = useMemo(() => stripes.connect(ConfigManager), [stripes]);

  const beforeSave = (data) => data || '';
  const getInitialValues = (settings) => (settings?.[0]?.value || '');

  const getTranslatedDataOptions = (field) => {
    return field.map(item => ({
      label: item.value ? intl.formatMessage({ id: `ui-users.settings.numberGenerator.options.${item.value}` }) : '',
      value: item.value,
    }));
  };

  const dataOptionsAllEnabled = getTranslatedDataOptions(NUMBER_GENERATOR_OPTIONS);

  return (
    <ConnectedConfigManager
      configName={NUMBER_GENERATOR_SETTINGS_KEY}
      formType="final-form"
      getInitialValues={getInitialValues}
      label={<FormattedMessage id="ui-users.settings.numberGenerator.options" />}
      onBeforeSave={beforeSave}
      scope={NUMBER_GENERATOR_SETTINGS_SCOPE}
    >
      <Row style={{ marginBottom: '2rem' }}>
        <Col xs={12}>
          <MessageBanner>
            <p><FormattedMessage id="ui-users.settings.numberGenerator.info" /></p>
            <p>
              <FormattedMessage
                id="ui-users.settings.numberGenerator.infoAdditional"
                values={{
                  serviceInteractionLink: (
                    <Link to={SERVICE_INTERACTION_LINK}>
                      <FormattedMessage id="stripes-core.settings" />{' > '}
                      <FormattedMessage id="ui-service-interaction.meta.title" />
                    </Link>
                  ),
                  numberGeneratorSequencesLink: (
                    <Link to={SERVICE_INTERACTION_NUMBER_GENERATOR_SEQUENCES_LINK}>
                      <FormattedMessage id="stripes-core.settings" />{' > '}
                      <FormattedMessage id="ui-service-interaction.meta.title" />{' > '}
                      <FormattedMessage id="ui-service-interaction.settings.numberGeneratorSequences" />
                    </Link>
                  ),
                }}
              />
            </p>
          </MessageBanner>
        </Col>
      </Row>
      <Row>
        <Col xs={6}>
          <Field
            component={Select}
            dataOptions={dataOptionsAllEnabled}
            id={BARCODE_SETTING}
            label={<FormattedMessage id="ui-users.settings.numberGenerator.barcode" />}
            name={BARCODE_SETTING}
          />
        </Col>
      </Row>
    </ConnectedConfigManager>
  );
};

export default NumberGeneratorSettings;
