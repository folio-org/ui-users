import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { withRouter } from 'react-router-dom';
import {
  Button,
  MenuItem,
  IconButton,
} from '@folio/stripes/components';
import { stripesShape } from '@folio/stripes/core';

import Popdown from './Popdown';
import css from './ActionsDropdown.css';

class ActionsDropdown extends React.Component {
  static propTypes = {
    stripes: stripesShape.isRequired,
    loan: PropTypes.object.isRequired,
    requestQueue: PropTypes.bool.isRequired,
    handleOptionsChange: PropTypes.func.isRequired,
    disableFeeFineDetails: PropTypes.bool,
    match: PropTypes.object,
  };

  itemClick = () => {
    this.props.handleOptionsChange();
  }

  renderDropdownTrigger = (triggerRef, onToggle, aria) => (
    <IconButton icon="ellipsis" ref={triggerRef} onClick={onToggle} {...aria} />
  );

  render() {
    const {
      loan,
      handleOptionsChange,
      requestQueue,
      stripes,
      disableFeeFineDetails,
    } = this.props;

    const itemDetailsLink = `/inventory/view/${loan.item.instanceId}/${loan.item.holdingsRecordId}/${loan.itemId}`;
    const loanPolicyLink = `/settings/circulation/loan-policies/${loan.loanPolicyId}`;
    const buttonDisabled = !this.props.stripes.hasPerm('ui-users.feesfines.actions.all');

    return (
      <Popdown
        renderTrigger={this.renderDropdownTrigger}
        portal
      >
        <div className={css.actionDropDown}>
          {
            stripes.hasPerm('inventory.items.item.get') &&
            <MenuItem
              itemMeta={{
                loan,
                action: 'itemDetails',
              }}
              onSelectItem={handleOptionsChange}
            >
              <Button
                buttonStyle="dropdownItem"
                to={itemDetailsLink}
                onClick={(e) => { e.stopPropagation(); }}
              >
                <FormattedMessage id="ui-users.itemDetails" />
              </Button>
            </MenuItem>
          }
          {
            stripes.hasPerm('ui-users.loans.renew') &&
            <MenuItem
              itemMeta={{
                loan,
                action: 'renew',
              }}
              onSelectItem={handleOptionsChange}
            >
              <Button
                buttonStyle="dropdownItem"
                data-test-dropdown-content-renew-button
                onClick={(e) => {
                  handleOptionsChange({ loan, action: 'renew' }, e);
                }}
              >
                <FormattedMessage id="ui-users.renew" />
              </Button>
            </MenuItem>
          }
          {
            stripes.hasPerm('ui-users.loans.edit') &&
            <MenuItem
              itemMeta={{
                loan,
                action: 'changeDueDate',
              }}
              onSelectItem={handleOptionsChange}
            >
              <Button
                buttonStyle="dropdownItem"
                onClick={(e) => { handleOptionsChange({ loan, action:'changeDueDate' }, e); }}
                data-test-dropdown-content-change-due-date-button
              >
                <FormattedMessage id="stripes-smart-components.cddd.changeDueDate" />
              </Button>
            </MenuItem>
          }
          <MenuItem
            itemMeta={{
              loan,
              action: 'showLoanPolicy',
            }}
            onSelectItem={handleOptionsChange}
          >
            <Button
              buttonStyle="dropdownItem"
              href={loanPolicyLink}
            >
              <FormattedMessage id="ui-users.loans.details.loanPolicy" />
            </Button>
          </MenuItem>
          <MenuItem
            itemMeta={{
              loan,
              action: 'feefine',
            }}
            onSelectItem={handleOptionsChange}
          >
            <Button buttonStyle="dropdownItem" disabled={buttonDisabled}>
              <FormattedMessage id="ui-users.loans.newFeeFine" />
            </Button>
          </MenuItem>
          <MenuItem
            itemMeta={{
              loan,
              action: 'feefinedetails',
            }}
            onSelectItem={handleOptionsChange}
          >
            <Button buttonStyle="dropdownItem" disabled={disableFeeFineDetails}>
              <FormattedMessage id="ui-users.loans.feeFineDetails" />
            </Button>
          </MenuItem>
          { requestQueue && stripes.hasPerm('ui-requests.all') &&
            <MenuItem
              itemMeta={{
                loan,
                action: 'discoverRequests',
              }}
              onSelectItem={handleOptionsChange}
            >
              <div data-test-dropdown-content-request-queue>
                <Button buttonStyle="dropdownItem">
                  <FormattedMessage id="ui-users.loans.details.requestQueue" />
                </Button>
              </div>
            </MenuItem>
          }
        </div>
      </Popdown>
    );
  }
}

export default withRouter(ActionsDropdown);
