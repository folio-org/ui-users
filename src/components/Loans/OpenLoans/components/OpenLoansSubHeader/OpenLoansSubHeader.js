import React from 'react';
import PropTypes from 'prop-types';
import {
  cloneDeep,
  isEmpty,
} from 'lodash';

import {
  FormattedMessage,
  injectIntl,
} from 'react-intl';

import { IfPermission } from '@folio/stripes/core';
import {
  Button,
  Dropdown,
  DropdownMenu,
  ExportCsv,
  Checkbox,
} from '@folio/stripes/components';

import ActionsBar from '../../../components/ActionsBar/ActionsBar';
import Label from '../../../../Label/Label';
import { itemStatuses } from '../../../../../constants';

import css from './OpenLoansSubHeader.css';

class OpenLoansSubHeader extends React.Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    checkedLoans: PropTypes.object.isRequired,
    columnMapping: PropTypes.object.isRequired,
    loans: PropTypes.arrayOf(PropTypes.object).isRequired,
    patronBlocks: PropTypes.arrayOf(PropTypes.object).isRequired,
    visibleColumns: PropTypes.arrayOf(PropTypes.object).isRequired,
    toggleColumn: PropTypes.func.isRequired,
    buildRecords: PropTypes.func.isRequired,
    renewSelected: PropTypes.func.isRequired,
    openPatronBlockedModal: PropTypes.func.isRequired,
    showChangeDueDateDialog: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      toggleDropdownState: false,
    };

    this.headers = [
      'action',
      'dueDate',
      'loanDate',
      'item.barcode',
      'item.callNumberComponents.prefix',
      'item.callNumberComponents.callNumber',
      'item.callNumberComponents.suffix',
      'item.enumeration',
      'item.volume',
      'item.contributors',
      'item.holdingsRecordId',
      'item.instanceId',
      'item.status.name',
      'item.title',
      'item.materialType.name',
      'item.location.name',
      'metaData.createdByUserId',
      'metadata.updatedDate',
      'metadata.updatedByUserId',
      'loanPolicyId',
    ];

    // Map to pass into exportCsv
    this.columnHeadersMap = this.headers.map(item => {
      return {
        label: props.intl.formatMessage({ id: `ui-users.${item}` }),
        value: item
      };
    });
  }

  renderCheckboxList(columnMapping) {
    const {
      visibleColumns,
      toggleColumn,
    } = this.props;

    return visibleColumns.filter((columnObj) => Object.keys(columnMapping)
      .includes(columnObj.title))
      .map((e, i) => {
        const columnName = columnMapping[e.title];

        return (
          <li key={`columnitem-${i}`}>
            <Checkbox
              label={columnName}
              name={columnName}
              id={columnName}
              onChange={() => toggleColumn(e.title)}
              checked={e.status}
            />
          </li>
        );
      });
  }

  onDropdownClick = () => {
    this.setState(({ toggleDropdownState }) => ({
      toggleDropdownState: !toggleDropdownState
    }));
  };

  // Compare a particular status name (@targetStatus) to all the items in the checkedLoans object.
  // Returns true if *all* the items have the target status, false otherwise.
  onlyStatusSelected = (targetStatus) => {
    // For better or worse, checkedLoans is passed down as an object with keys corresponding to the loan UUIDs
    // and values being the associated loan properties -- e.g. { uuid: {loan}, uuid2: {loan2} }. This makes
    // it a little complicated to determine whether any loan in checkedLoans has a particular property -- like
    // an item that's been declared lost
    return !Object
      .values(this.props.checkedLoans)
      .find(loan => loan?.item?.status?.name !== targetStatus);
  }

  render() {
    const {
      loans,
      renewSelected,
      showChangeDueDateDialog,
      checkedLoans,
      columnMapping,
      buildRecords,
      patronBlocks,
      openPatronBlockedModal,
    } = this.props;

    const {
      toggleDropdownState,
    } = this.state;

    const noSelectedLoans = isEmpty(checkedLoans);
    const resultCount = <FormattedMessage id="ui-users.resultCount" values={{ count: loans.length }} />;
    const clonedLoans = cloneDeep(loans);
    const recordsToCSV = buildRecords(clonedLoans);
    const countRenews = patronBlocks.filter(p => p.renewals === true);
    // For better or worse, checkedLoans is passed down as an object with keys corresponding to the loan UUIDs
    // and values being the associated loan properties -- e.g. { uuid: {loan}, uuid2: {loan2} }. This makes
    // it a little complicated to determine whether any loan in checkedLoans has a particular property -- like
    // an item that's been declared lost
    const onlyLostItemsSelected = !Object.values(checkedLoans).find(loan => loan?.item?.status?.name !== 'Declared lost');
    const onlyClaimedReturnedItemsSelected = !Object.values(checkedLoans).find(loan => loan?.item?.status?.name !== 'Claimed returned');

    return (
      <ActionsBar
        contentStart={
          <span style={{ display: 'flex' }}>
            <Label>
              {resultCount}
            </Label>
            <Dropdown
              id="columnsDropdown"
              className={css.columnsDropdown}
              group
              pullRight
              onToggle={this.onDropdownClick}
              open={toggleDropdownState}
            >
              <Button
                data-role="toggle"
                align="end"
                bottomMargin0
                aria-haspopup="true"
              >
                <FormattedMessage id="ui-users.selectColumns" />
              </Button>
              <DropdownMenu
                data-role="menu"
                aria-label="available permissions"
              >
                <ul>
                  {this.renderCheckboxList(columnMapping)}
                </ul>
              </DropdownMenu>
            </Dropdown>
          </span>
        }
        contentEnd={
          <span>
            <IfPermission perm="ui-users.loans.renew">
              <Button
                marginBottom0
                id="renew-all"
                disabled={noSelectedLoans}
                onClick={!isEmpty(countRenews)
                  ? openPatronBlockedModal
                  : renewSelected
                }
              >
                <FormattedMessage id="ui-users.renew" />
              </Button>
            </IfPermission>
            <Button
              marginBottom0
              id="bulk-claim-returned"
              disabled={noSelectedLoans || this.onlyStatusSelected(itemStatuses.CLAIMED_RETURNED)}
              onClick={showChangeDueDateDialog}
            >
              <FormattedMessage id="ui-users.loans.claimReturned" />
            </Button>         
            <IfPermission perm="ui-users.loans.edit">
              <Button
                marginBottom0
                id="change-due-date-all"
                disabled={noSelectedLoans || this.onlyStatusSelected(itemStatuses.DECLARED_LOST)}
                onClick={showChangeDueDateDialog}
              >
                <FormattedMessage id="stripes-smart-components.cddd.changeDueDate" />
              </Button>
            </IfPermission>
            <ExportCsv
              data={recordsToCSV}
              onlyFields={this.columnHeadersMap}
            />
          </span>
        }
      />
    );
  }
}

export default injectIntl(OpenLoansSubHeader);
