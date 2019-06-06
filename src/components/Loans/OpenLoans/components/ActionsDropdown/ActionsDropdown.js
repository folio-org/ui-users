import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { withRouter } from 'react-router-dom';
import {
  Button,
  UncontrolledDropdown,
  DropdownMenu,
  MenuItem,
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
    match: PropTypes.object,
  };

  render() {
    const {
      loan,
      handleOptionsChange,
      requestQueue,
      stripes,
      disableFeeFineDetails,
      match: { params }
    } = this.props;

    const itemDetailsLink = `/inventory/view/${loan.item.instanceId}/${loan.item.holdingsRecordId}/${loan.itemId}`;
    const loanPolicyLink = `/settings/circulation/loan-policies/${loan.loanPolicyId}`;
    const chargeFeeFineLink = `/users/${params.id}/charge/${loan.id}`;
    const buttonDisabled = !this.props.stripes.hasPerm('ui-users.feesfines.actions.all');

    return (
      <UncontrolledDropdown>
        <IconButton
          data-role="toggle"
          icon="ellipsis"
          size="small"
          iconSize="medium"
        />
        <DropdownMenu
          data-role="menu"
        >
          {
            stripes.hasPerm('inventory.items.item.get') &&
              <Button
                buttonStyle="dropdownItem"
                to={itemDetailsLink}
                onClick={(e) => { e.stopPropagation(); }}
              >
                <FormattedMessage id="ui-users.itemDetails" />
              </Button>
          }
          <MenuItem>
            <Button
              buttonStyle="dropdownItem"
              onClick={(e) => { handleOptionsChange({ loan, action:'renew' }, e); }}
            >
              <FormattedMessage id="ui-users.renew" />
            </Button>
          </MenuItem>

          <MenuItem>
            <Button
              buttonStyle="dropdownItem"
              onClick={(e) => { handleOptionsChange({ loan, action:'changeDueDate' }, e); }}
            >
              <FormattedMessage id="stripes-smart-components.cddd.changeDueDate" />
            </Button>
          </MenuItem>

          <Button
            buttonStyle="dropdownItem"
            to={loanPolicyLink}
            onClick={(e) => { e.stopPropagation(); }}
          >
            <FormattedMessage id="ui-users.loans.details.loanPolicy" />
          </Button>

          <Button
            buttonStyle="dropdownItem"
            disabled={buttonDisabled}
            to={chargeFeeFineLink}
            onClick={(e) => { e.stopPropagation(); }}
          >
            <FormattedMessage id="ui-users.loans.newFeeFine" />
          </Button>

          <Button
            buttonStyle="dropdownItem"
            disabled={disableFeeFineDetails}
            onClick={(e) => { handleOptionsChange({ loan, action:'feefinedetails' }, e); }}
          >
            <FormattedMessage id="ui-users.loans.feeFineDetails" />
          </Button>

          { requestQueue && stripes.hasPerm('ui-requests.all') &&
            <div data-test-dropdown-content-request-queue>
              <Button
                buttonStyle="dropdownItem"
                onClick={(e) => { handleOptionsChange({ loan, action:'discoverRequests' }, e); }}
              >
                <FormattedMessage id="ui-users.loans.details.requestQueue" />
              </Button>
            </div>
          }
        </DropdownMenu>
      </UncontrolledDropdown>
    );
  }
}

export default withRouter(ActionsDropdown);
