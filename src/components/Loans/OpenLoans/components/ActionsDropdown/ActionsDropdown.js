import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  Button,
  UncontrolledDropdown,
  MenuItem,
  DropdownMenu,
  IconButton,
} from '@folio/stripes/components';
import {
  stripesShape,
} from '@folio/stripes/core';

class ActionsDropdown extends React.Component {
  static propTypes = {
    stripes: stripesShape.isRequired,
    loan: PropTypes.object.isRequired,
    requestQueue: PropTypes.bool.isRequired,
    handleOptionsChange: PropTypes.func.isRequired,
    disableFeeFineDetails: PropTypes.bool,
  };

  render() {
    const {
      loan,
      requestQueue,
      handleOptionsChange,
      stripes,
      disableFeeFineDetails,
    } = this.props;

    const itemDetailsLink = `/inventory/view/${loan.item.instanceId}/${loan.item.holdingsRecordId}/${loan.itemId}`;
    const loanPolicyLink = `/settings/circulation/loan-policies/${loan.loanPolicyId}`;
    const buttonDisabled = !this.props.stripes.hasPerm('ui-users.feesfines.actions.all');

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
          {
            stripes.hasPerm('inventory.items.item.get') &&
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
          }
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
            <Button buttonStyle="dropdownItem" disabled={buttonDisabled}>
              <FormattedMessage id="ui-users.loans.newFeeFine" />
            </Button>
          </MenuItem>
          <MenuItem itemMeta={{
            loan,
            action: 'feefinedetails',
          }}
          >
            <Button buttonStyle="dropdownItem" disabled={disableFeeFineDetails}>
              <FormattedMessage id="ui-users.loans.feeFineDetails" />
            </Button>
          </MenuItem>
          { requestQueue && stripes.hasPerm('ui-requests.all') &&
            <MenuItem itemMeta={{
              loan,
              action: 'discoverRequests',
            }}
            >
              <div data-test-dropdown-content-request-queue>
                <Button buttonStyle="dropdownItem">
                  <FormattedMessage id="ui-users.loans.details.requestQueue" />
                </Button>
              </div>
            </MenuItem>
          }
        </DropdownMenu>
      </UncontrolledDropdown>
    );
  }
}

export default ActionsDropdown;
