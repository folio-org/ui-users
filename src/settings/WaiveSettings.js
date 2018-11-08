import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { ControlledVocab } from '@folio/stripes/smart-components';
import { validate } from '../util';

class WaiveSettings extends React.Component {
  static propTypes = {
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
    }).isRequired,
  };

  constructor(props) {
    super(props);
    this.connectedControlledVocab = props.stripes.connect(ControlledVocab);
  }

  render() {
    const label = <FormattedMessage id="uui-users.waives.singular" />;

    return (
      <this.connectedControlledVocab
        stripes={this.props.stripes}
        validate={(item, index, items) => validate(item, index, items, 'nameReason', label)}
        baseUrl="waives"
        records="waives"
        label={<FormattedMessage id="ui-users.waives.label" />}
        labelSingular={label}
        objectLabel=""
        visibleFields={['nameReason', 'description']}
        columnMapping={{
          'nameReason': <FormattedMessage id="ui-users.waives.columns.reason" />,
          'description': <FormattedMessage id="ui-users.waives.columns.desc" />,
        }}
        nameKey="waiveReasons"
        hiddenFields={['numberOfObjects']}
        id="waives"
        sortby="nameReason"
      />
    );
  }
}

export default WaiveSettings;
