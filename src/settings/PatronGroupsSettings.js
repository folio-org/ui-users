import React from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
  injectIntl,
} from 'react-intl';
import { ControlledVocab } from '@folio/stripes/smart-components';
import { stripesConnect, withStripes } from '@folio/stripes/core';

class PatronGroupsSettings extends React.Component {
  // adding the desired-count parameter, :50, to this query is an egregious
  // hack that willfully and knowingly abuses facets to contort them to
  // handle a reporting situation they were simply not designed for.
  // this may become inefficient with a large number of users; it will
  // certainly be non-functional with a large number (> 50) of groups.
  // FIXME details at https://issues.folio.org/projects/MODUSERS/issues/MODUSERS-57
  static manifest = Object.freeze({
    usersPerGroup: {
      type: 'okapi',
      records: 'users',
      path: 'users?limit=0&facets=patronGroup:50',
    },
  });

  static propTypes = {
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
    }).isRequired,
    resources: PropTypes.shape({
      usersPerGroup: PropTypes.object,
    }).isRequired,
    intl: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.connectedControlledVocab = props.stripes.connect(ControlledVocab);
  }

  isPositiveInteger = (n) => {
    return !Number.isNaN(n) && Number.parseInt(n, 10) >= 1;
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

export default injectIntl(withStripes(stripesConnect(PatronGroupsSettings)));
