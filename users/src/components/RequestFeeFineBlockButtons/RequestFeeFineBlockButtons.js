import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import queryString from 'query-string';
import { withRouter } from 'react-router-dom';

import {
  Button,
  Icon,
} from '@folio/stripes/components';
import { IfPermission } from '@folio/stripes/core';

class RequestFeeFineBlockButtons extends React.Component {
  static propTypes = {
    barcode: PropTypes.string,
    onToggle: PropTypes.func,
    userId: PropTypes.string,
    location: PropTypes.object,
  };

  render() {
    const {
      barcode,
      onToggle,
      userId,
      location,
    } = this.props;
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
            <Icon icon="plus-sign">
              <FormattedMessage id="ui-users.requests.createRequest" />
            </Icon>
          </Button>
        </IfPermission>
        <IfPermission perm="ui-users.feesfines.actions.all">
          <Button
            buttonStyle="dropdownItem"
            data-test-actions-menu-create-feesfines
            to={{ pathname: `/users/${userId}/charge` }}
            onClick={onToggle}
          >
            <Icon icon="plus-sign">
              <FormattedMessage id="ui-users.accounts.chargeManual" />
            </Icon>
          </Button>
        </IfPermission>
        <IfPermission perm="ui-users.patron_blocks">
          <Button
            buttonStyle="dropdownItem"
            data-test-actions-menu-create-patronblocks
            id="create-patron-block"
            to={{
              pathname: `/users/${userId}/patronblocks/create`,
              search: location.search,
            }}
            onClick={onToggle}
          >
            <Icon icon="plus-sign">
              <FormattedMessage id="ui-users.blocks.buttons.add" />
            </Icon>
          </Button>
        </IfPermission>
      </div>
    );
  }
}

export default withRouter(RequestFeeFineBlockButtons);
