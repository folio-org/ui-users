import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Field } from 'react-final-form';

import { stripesConnect, withStripes } from '@folio/stripes/core';
import { ConfigManager } from '@folio/stripes/smart-components';

import { Checkbox, Col, Row } from '@folio/stripes-components';

class NumberGeneratorOptions extends React.Component {
  static propTypes = {
    stripes: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.connectedConfigManager = stripesConnect(ConfigManager);
  }

  defaultValues = {
    useGeneratorForBarcode: true
  };

  beforeSave(data) {
    return JSON.stringify(data);
  }

  getInitialValues = (settings) => {
    let loadedValues = {};
    try {
      const value = settings.length === 0 ? '' : settings[0].value;
      loadedValues = JSON.parse(value);
    } catch (e) { } // eslint-disable-line no-empty
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
            <Field
              component={Checkbox}
              type="checkbox"
              id="useGeneratorForBarcode"
              name="useGeneratorForBarcode"
              label={<FormattedMessage id="ui-users.settings.numberGeneratorOptions.useGeneratorForBarcode" />}
            />
          </Col>
        </Row>
      </this.connectedConfigManager>
    );
  }
}

export default withStripes(NumberGeneratorOptions);
