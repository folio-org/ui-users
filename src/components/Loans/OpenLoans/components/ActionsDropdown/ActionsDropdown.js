import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { FormattedMessage } from 'react-intl';

import {
  Button,
  UncontrolledDropdown,
  MenuItem,
  DropdownMenu,
  IconButton,
} from '@folio/stripes/components';
import {
  IfPermission,
  stripesShape,
} from '@folio/stripes/core';

class ActionsDropdown extends React.Component {
  static propTypes = {
    stripes: stripesShape.isRequired,
    loan: PropTypes.object.isRequired,
    requestQueue: PropTypes.bool.isRequired,
    handleOptionsChange: PropTypes.func.isRequired,
  };

  render() {
    const {
      loan,
      requestQueue,
      handleOptionsChange,
      stripes,
    } = this.props;

    const itemDetailsLink = `/inventory/view/${loan.item.instanceId}/${loan.item.holdingsRecordId}/${loan.itemId}`;
    const loanPolicyLink = `/settings/circulation/loan-policies/${loan.loanPolicyId}`;

    return (
      <UncontrolledDropdown onSelectItem={handleOptionsChange}>
        <IconButton
          data-role="toggle"
          icon="ellipsis"
          size="small"
          iconSize="medium"
        />
        <DropdownMenu
          data-role="menu"
          overrideStyle={{ padding: '7px 3px' }}
        >
          <IfPermission perm="inventory.items.item.get">
            <MenuItem itemMeta={{
              loan,
              action: 'itemDetails',
            }}
            >
              <Button
                buttonStyle="dropdownItem"
                href={itemDetailsLink}
              >
                <FormattedMessage id="ui-users.itemDetails" />
              </Button>
            </MenuItem>
          </IfPermission>
          <MenuItem itemMeta={{
            loan,
            action: 'renew',
          }}
          >
            <Button buttonStyle="dropdownItem">
              <FormattedMessage id="ui-users.renew" />
            </Button>
          </MenuItem>
          <MenuItem itemMeta={{
            loan,
            action: 'changeDueDate',
          }}
          >
            <Button buttonStyle="dropdownItem">
              <FormattedMessage id="stripes-smart-components.cddd.changeDueDate" />
            </Button>
          </MenuItem>
          <MenuItem itemMeta={{
            loan,
            action: 'showLoanPolicy',
          }}
          >
            <Button
              buttonStyle="dropdownItem"
              href={loanPolicyLink}
            >
              <FormattedMessage id="ui-users.loans.details.loanPolicy" />
            </Button>
          </MenuItem>
          <MenuItem itemMeta={{
            loan,
            action: 'feefine',
          }}
          >
            <Button buttonStyle="dropdownItem">
              <FormattedMessage id="ui-users.loans.newFeeFine" />
            </Button>
          </MenuItem>
          <MenuItem itemMeta={{
            loan,
            action: 'feefinedetails',
          }}
          >
            <Button buttonStyle="dropdownItem">Fee/fine details</Button>
          </MenuItem>
          { requestQueue && stripes.hasPerm('ui-requests.all') &&
            <MenuItem itemMeta={{
              loan,
              action: 'showRequestQueue',
            }}
            >
              <Button
                buttonStyle="dropdownItem"
                href={`/requests?&query=${get(loan, ['item', 'barcode'])}&filters=requestStatus.open%20-%20not%20yet%20filled%2CrequestStatus.open%20-%20awaiting%20pickup&sort=Request%20Date`}
              >
                <FormattedMessage id="ui-users.loans.details.requestQueue" />
              </Button>
            </MenuItem>
          }
        </DropdownMenu>
      </UncontrolledDropdown>
    );
  }
}

export default ActionsDropdown;
