import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { ControlledVocab } from '@folio/stripes/smart-components';
import { validate } from '../util';

class OwnerSettings extends React.Component {
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
    const label = <FormattedMessage id="ui-users.owners.singular" />;

    return (
      <this.connectedControlledVocab
        {...this.props}
        validate={(item, index, items) => validate(item, index, items, 'owner', label)}
        baseUrl="owners"
        records="owners"
        label={<FormattedMessage id="ui-users.owners.label" />}
        labelSingular={label}
        objectLabel=""
        hiddenFields={['numberOfObjects']}
        visibleFields={['owner', 'desc']}
        columnMapping={{
          owner: <FormattedMessage id="ui-users.owners.columns.owner" />,
          desc: <FormattedMessage id="ui-users.owners.columns.desc" />,
        }}
        nameKey="ownerType"
        id="ownerstypes"
        sortby="owner"
      />
    );
  }
}

export default OwnerSettings;
