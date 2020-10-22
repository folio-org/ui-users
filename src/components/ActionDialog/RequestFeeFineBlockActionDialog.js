import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import queryString from 'query-string';

import { Button } from '@folio/stripes/components';
import { IfPermission } from '@folio/stripes/core';

class RequestFeeFineBlockActionDialog extends React.Component {
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
      <div data-test-actions-menu>
        <IfPermission perm="ui-requests.all">
          <Button
            buttonStyle="dropdownItem"
            data-test-actions-menu-create-request
            to={linkToCreateRequest}
            onClick={onToggle}
          >
            <FormattedMessage id="ui-users.requests.createRequest" />
          </Button>
        </IfPermission>
        <IfPermission perm="ui-users.feesfines.actions.all">
          <Button
            buttonStyle="dropdownItem"
            data-test-actions-menu-create-feesfines
            to={{ pathname: `/users/${userId}/charge` }}
            onClick={onToggle}
          >
            <FormattedMessage id="ui-users.accounts.chargeManual" />
          </Button>
        </IfPermission>
        <IfPermission perm="ui-users.patron_blocks">
          <Button
            buttonStyle="dropdownItem"
            data-test-actions-menu-create-patronblocks
            id="create-patron-block"
            to={{ pathname: `/users/${userId}/patronblocks/create` }}
            onClick={onToggle}
          >
            <FormattedMessage id="ui-users.blocks.buttons.add" />
          </Button>
        </IfPermission>
      </div>
    );
  }
}

export default RequestFeeFineBlockActionDialog;
