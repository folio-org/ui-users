import React from 'react';
import PropTypes from 'prop-types';
import {
  injectIntl,
  FormattedMessage,
} from 'react-intl';
import {
  Label,
} from '@folio/stripes/components';
import { ControlledVocab } from '@folio/stripes/smart-components';
import { stripesConnect } from '@folio/stripes/core';
import { validate } from '../components/util';

const columnMapping = {
  nameReason: (
    <Label
      tagName="span"
      required
    >
      <FormattedMessage id="ui-users.waives.columns.reason" />
    </Label>
  ),
  description: <FormattedMessage id="ui-users.waives.columns.desc" />,
};

class WaiveSettings extends React.Component {
  static propTypes = {
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
      hasPerm: PropTypes.func.isRequired,
    }).isRequired,
    intl: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.connectedControlledVocab = props.stripes.connect(ControlledVocab);
  }

  render() {
    const {
      stripes,
      intl,
    } = this.props;

    const label = intl.formatMessage({ id: 'ui-users.waives.singular' });
    const editable = stripes.hasPerm('ui-users.settings.waives.all');

    return (
      <this.connectedControlledVocab
        stripes={stripes}
        validate={(item, index, items) => validate(item, index, items, 'nameReason', label)}
        baseUrl="waives"
        records="waivers"
        label={intl.formatMessage({ id: 'ui-users.waives.label' })}
        labelSingular={label}
        objectLabel=""
        visibleFields={['nameReason', 'description']}
        columnMapping={columnMapping}
        nameKey="waiveReasons"
        hiddenFields={['numberOfObjects']}
        id="settings-waives"
        sortby="nameReason"
        editable={editable}
      />
    );
  }
}

export default injectIntl(stripesConnect(WaiveSettings));
