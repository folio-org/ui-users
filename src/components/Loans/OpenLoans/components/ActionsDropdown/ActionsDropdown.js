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

class ActionsDropdown extends React.Component {

  static propTypes = {
    loan: PropTypes.object.isRequired,
    requestQueue: PropTypes.bool.isRequired,
    handleOptionsChange: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.overrideStyle = { padding: '7px 3px' };
  }

  render() {
    const {
      loan,
      requestQueue,
      handleOptionsChange,
    } = this.props;

    const itemDetailsLink = `/inventory/view/${loan.item.instanceId}/${loan.item.holdingsRecordId}/${loan.itemId}`;
    const loanPolicyLink = `/settings/circulation/loan-policies/${loan.loanPolicyId}`;
    const requestQueueLink = `/requests?&query=${_.get(loan, ['item', 'barcode'])}&sort=Request%20Date`;

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
          overrideStyle={this.overrideStyle}
        >
          <MenuItem itemMeta={{
            loan,
            action: 'itemDetails',
          }}
          >
            <Button
              buttonStyle="dropdownItem"
              href={itemDetailsLink}
            >
              <FormattedMessage
                id="ui-users.itemDetails"
              />
            </Button>
          </MenuItem>
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
              <FormattedMessage
                id="ui-users.loans.details.loanPolicy"
              />
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
          {requestQueue &&
            <MenuItem itemMeta={{
              loan,
              action: 'showRequestQueue',
            }}
            >
              <Button
                buttonStyle="dropdownItem"
                href={requestQueueLink}
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
