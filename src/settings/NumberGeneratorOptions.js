import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Field } from 'react-final-form';

import { stripesConnect, withStripes } from '@folio/stripes/core';
import { ConfigManager } from '@folio/stripes/smart-components';

import { Col, MessageBanner, RadioButton, Row } from '@folio/stripes/components';

import css from './NumberGeneratorOptions.css';

class NumberGeneratorOptions extends React.Component {
  static propTypes = {
    stripes: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.connectedConfigManager = stripesConnect(ConfigManager);
  }

  defaultValues = {
    barcodeGeneratorSetting: 'useTextField'
  };

  beforeSave(data) {
    return JSON.stringify(data);
  }

  getInitialValues = (settings) => {
    let loadedValues = {};
    try {
      const value = settings.length === 0 ? '' : settings[0].value;
      loadedValues = JSON.parse(value);
    } catch (e) {
      // Make sure we return _something_ because ConfigManager no longer has a safety check here
      return {};
    }

    return {
      ...this.defaultValues,
      ...loadedValues,
    };
  }

  render() {
    return (
      <this.connectedConfigManager
        configName="number_generator"
        getInitialValues={this.getInitialValues}
        label={<FormattedMessage id="ui-users.settings.numberGeneratorOptions" />}
        moduleName="USERS"
        onBeforeSave={this.beforeSave}
        stripes={this.props.stripes}
        formType="final-form"
      >
        <Row>
          <Col xs={12}>
            <div className={css.marginBottomGutter}>
              <MessageBanner>
                <FormattedMessage id="ui-users.settings.numberGeneratorOptions.info" />
              </MessageBanner>
            </div>
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <Field
              component={RadioButton}
              id="useTextField"
              name="barcodeGeneratorSetting"
              label={<FormattedMessage id="ui-users.settings.numberGeneratorOptions.useTextFieldForBarcode" />}
              type="radio"
              value="useTextField"
            />
            <Field
              component={RadioButton}
              id="useBoth"
              name="barcodeGeneratorSetting"
              label={<FormattedMessage id="ui-users.settings.numberGeneratorOptions.useBothForBarcode" />}
              type="radio"
              value="useBoth"
            />
            <Field
              component={RadioButton}
              id="useGenerator"
              name="barcodeGeneratorSetting"
              label={<FormattedMessage id="ui-users.settings.numberGeneratorOptions.useGeneratorForBarcode" />}
              type="radio"
              value="useGenerator"
            />
          </Col>
        </Row>
      </this.connectedConfigManager>
    );
  }
}

export default withStripes(NumberGeneratorOptions);
