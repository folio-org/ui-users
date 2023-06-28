import React from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
  injectIntl,
} from 'react-intl';
import { ControlledVocab } from '@folio/stripes/smart-components';
import { withStripes } from '@folio/stripes/core';

class PatronGroupsSettings extends React.Component {
  static propTypes = {
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
    }).isRequired,

    intl: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.connectedControlledVocab = props.stripes.connect(ControlledVocab);
  }

  isPositiveInteger = (n) => {
    // match integer by regular expression as backend does not accept input like '5.0'
    const isInteger = val => /^\d+$/.test(val);
    const isGreaterEqualOne = val => Number.parseInt(val, 10) >= 1;
    return isInteger(n) && isGreaterEqualOne(n);
  };

  isValidExpirationOffset = (n) => {
    if (n) {
      return this.isPositiveInteger(n);
    }
    return true;
  }

  validateFields = (item, _index, _items) => ({
    expirationOffsetInDays: this.isValidExpirationOffset(item.expirationOffsetInDays)
      ? undefined
      : this.props.intl.formatMessage({ id: 'ui-users.information.patronGroup.expirationOffset.error' }),
  });

  render() {
    const { intl } = this.props;

    return (
      <this.connectedControlledVocab
        {...this.props}
        // We have to unset the dataKey to prevent the props.resources in
        // <ControlledVocab> from being overwritten by the props.resources here.
        dataKey={undefined}
        baseUrl="groups"
        records="usergroups"
        label={intl.formatMessage({ id: 'ui-users.information.patronGroups' })}
        labelSingular={intl.formatMessage({ id: 'ui-users.information.patronGroup' })}
        objectLabel={<FormattedMessage id="ui-users.information.patronGroup.users" />}
        visibleFields={['group', 'desc', 'expirationOffsetInDays']}
        hiddenFields={['numberOfObjects']}
        columnMapping={{
          group: intl.formatMessage({ id: 'ui-users.information.patronGroup' }),
          desc: intl.formatMessage({ id: 'ui-users.description' }),
          expirationOffsetInDays: intl.formatMessage({ id: 'ui-users.information.patronGroup.expirationOffset' }),
        }}
        validate={this.validateFields}
        nameKey="group"
        id="patrongroups"
        sortby="group"
      />
    );
  }
}

export default injectIntl(withStripes(PatronGroupsSettings));
