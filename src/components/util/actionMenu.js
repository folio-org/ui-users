import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import queryString from 'query-string';

import { Button } from '@folio/stripes/components';
import { IfPermission } from '@folio/stripes/core';

class ActionMenuCreateButtons extends React.Component {
  static propTypes = {
    barcode: PropTypes.string,
    onToggle: PropTypes.func,
    userId: PropTypes.string,
  };

  render() {
    const { barcode, onToggle, userId } = this.props;
    const linkToCreateRequest = barcode ?
      `/requests/?${queryString.stringify({ layer: 'create', userBarcode: barcode })}` :
      `/requests/?${queryString.stringify({ layer: 'create' })}`;

    return (
      <>
        <IfPermission perm="ui-requests.all">
          <Button
            buttonStyle="dropdownItem"
            to={linkToCreateRequest}
            onClick={onToggle}
          >
            <FormattedMessage id="ui-users.requests.createRequest" />
          </Button>
        </IfPermission>
        <IfPermission perm="ui-users.feesfines.actions.all">
          <Button
            buttonStyle="dropdownItem"
            to={{ pathname: `/users/${userId}/charge` }}
            onClick={onToggle}
          >
            <FormattedMessage id="ui-users.accounts.chargeManual" />
          </Button>
        </IfPermission>
        <IfPermission perm="ui-users.patron_blocks">
          <Button
            buttonStyle="dropdownItem"
            id="create-patron-block"
            to={{ pathname: `/users/${userId}/patronblocks/create` }}
            onClick={onToggle}
          >
            <FormattedMessage id="ui-users.blocks.buttons.add" />
          </Button>
        </IfPermission>
      </>
    );
  }
}

export default ActionMenuCreateButtons;
