import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { withRouter } from 'react-router-dom';

import {
  Button,
  IconButton,
  Dropdown,
  DropdownMenu,
} from '@folio/stripes/components';
import {
  stripesShape,
  IfPermission,
} from '@folio/stripes/core';

import {
  getChargeFineToLoanPath,
  getOpenRequestsPath,
} from '../../../../util';

import { itemStatuses } from '../../../../../constants';

class ActionsDropdown extends React.Component {
  static propTypes = {
    stripes: stripesShape.isRequired,
    loan: PropTypes.object.isRequired,
    requestQueue: PropTypes.bool.isRequired,
    handleOptionsChange: PropTypes.func.isRequired,
    disableFeeFineDetails: PropTypes.bool,
    match: PropTypes.shape({
      params: PropTypes.object
    }),
  };

  renderMenu = ({ onToggle }) => {
    const {
      loan,
      handleOptionsChange,
      requestQueue,
      stripes,
      disableFeeFineDetails,
      match: { params },
    } = this.props;

    const itemStatusName = loan?.item?.status?.name;
    const itemDetailsLink = `/inventory/view/${loan.item.instanceId}/${loan.item.holdingsRecordId}/${loan.itemId}`;
    const loanPolicyLink = `/settings/circulation/loan-policies/${loan.loanPolicyId}`;
    const buttonDisabled = !stripes.hasPerm('ui-users.feesfines.actions.all');

    return (
      <DropdownMenu data-role="menu">
        <IfPermission perm="inventory.items.item.get">
          <Button
            buttonStyle="dropdownItem"
            to={itemDetailsLink}
          >
            <FormattedMessage id="ui-users.itemDetails" />
          </Button>
        </IfPermission>
        <IfPermission perm="ui-users.loans.renew">
          { itemStatusName !== itemStatuses.CLAIMED_RETURNED &&
          <Button
            buttonStyle="dropdownItem"
            data-test-dropdown-content-renew-button
            onClick={e => {
              handleOptionsChange({ loan, action: 'renew' });
              onToggle(e);
            }}
          >
            <FormattedMessage id="ui-users.renew" />
          </Button>
          }
        </IfPermission>
        <IfPermission perm="ui-users.loans.claim-item-returned">
          { itemStatusName !== itemStatuses.CLAIMED_RETURNED &&
            <Button
              buttonStyle="dropdownItem"
              data-test-dropdown-content-claim-returned-button
              onClick={e => {
                handleOptionsChange({ loan, action:'claimReturned' });
                onToggle(e);
              }}
            >
              <FormattedMessage id="ui-users.loans.claimReturned" />
            </Button>
          }
        </IfPermission>
        <IfPermission perm="ui-users.loans.edit">
          { itemStatusName !== itemStatuses.DECLARED_LOST &&
            itemStatusName !== itemStatuses.CLAIMED_RETURNED &&
            <Button
              buttonStyle="dropdownItem"
              data-test-dropdown-content-change-due-date-button
              onClick={(e) => {
                handleOptionsChange({ loan, action:'changeDueDate' });
                onToggle(e);
              }}
            >
              <FormattedMessage id="stripes-smart-components.cddd.changeDueDate" />
            </Button>
          }
        </IfPermission>
        <IfPermission perm="ui-users.loans.declare-item-lost">
          { itemStatusName !== itemStatuses.DECLARED_LOST &&
            <Button
              buttonStyle="dropdownItem"
              data-test-dropdown-content-declare-lost-button
              onClick={e => {
                handleOptionsChange({ loan, action:'declareLost' });
                onToggle(e);
              }}
            >
              <FormattedMessage id="ui-users.loans.declareLost" />
            </Button>
          }
        </IfPermission>
        <IfPermission perm="ui-users.loans.declare-claimed-returned-item-as-missing">
          { itemStatusName === itemStatuses.CLAIMED_RETURNED &&
          <Button
            buttonStyle="dropdownItem"
            data-test-dropdown-content-mark-as-missing-button
            onClick={e => {
              handleOptionsChange({ loan, action:'markAsMissing' });
              onToggle(e);
            }}
          >
            <FormattedMessage id="ui-users.loans.markAsMissing" />
          </Button>
        }
        </IfPermission>
        <IfPermission perm="circulation-storage.loan-policies.item.get">
          <Button
            buttonStyle="dropdownItem"
            to={loanPolicyLink}
          >
            <FormattedMessage id="ui-users.loans.details.loanPolicy" />
          </Button>
        </IfPermission>
        <Button
          buttonStyle="dropdownItem"
          disabled={buttonDisabled}
          to={getChargeFineToLoanPath(params.id, loan.id)}
        >
          <FormattedMessage id="ui-users.loans.newFeeFine" />
        </Button>
        <Button
          buttonStyle="dropdownItem"
          disabled={disableFeeFineDetails}
          onClick={() => {
            handleOptionsChange({ loan, action: 'feefineDetails' });
          }}
        >
          <FormattedMessage id="ui-users.loans.feeFineDetails" />
        </Button>
        {requestQueue && stripes.hasPerm('ui-requests.all') &&
          <Button
            buttonStyle="dropdownItem"
            data-test-dropdown-content-request-queue
            to={getOpenRequestsPath(loan?.item?.barcode)}
          >
            <FormattedMessage id="ui-users.loans.details.requestQueue" />
          </Button>
        }
      </DropdownMenu>
    );
  };

  render() {
    return (
      <Dropdown
        renderTrigger={({ getTriggerProps }) => (
          <IconButton
            {...getTriggerProps()}
            icon="ellipsis"
          />
        )}
        renderMenu={this.renderMenu}
      />
    );
  }
}

export default withRouter(ActionsDropdown);
