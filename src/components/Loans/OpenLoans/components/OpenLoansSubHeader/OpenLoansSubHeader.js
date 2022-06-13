import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  cloneDeep,
  isEmpty,
} from 'lodash';
import { useIntl } from 'react-intl';

import { IfPermission } from '@folio/stripes/core';
import {
  Button,
  Dropdown,
  DropdownMenu,
  ExportCsv,
  Checkbox,
} from '@folio/stripes/components';

import ActionsBar from '../../../components/ActionsBar/ActionsBar';
import { itemStatuses } from '../../../../../constants';
import {
  hasEveryLoanItemStatus,
  hasAnyLoanItemStatus,
  getRenewalPatronBlocksFromPatronBlocks,
  checkUserActive,
} from '../../../../util';

import css from './OpenLoansSubHeader.css';

// For convenience of enabling or disabling buttons for similar item states,
// this groups together all the relevant item statuses for items that are
// lost in one way or another ('losty' items?).
const lostItemStatuses = [
  itemStatuses.AGED_TO_LOST,
  itemStatuses.CLAIMED_RETURNED,
  itemStatuses.DECLARED_LOST,
];

const OpenLoansSubHeader = ({
  buildRecords,
  checkedLoans,
  columnMapping,
  loans,
  openBulkClaimReturnedModal,
  openPatronBlockedModal,
  patronBlocks,
  renewSelected,
  showChangeDueDateDialog,
  toggleColumn,
  user,
  visibleColumns,
}) => {
  const intl = useIntl();

  const [toggleDropdownState, setToggleDropdownState] = useState(false);

  const headers = [
    'action',
    'dueDate',
    'loanDate',
    'item.barcode',
    'item.callNumberComponents.prefix',
    'item.callNumberComponents.callNumber',
    'item.callNumberComponents.suffix',
    'item.volume',
    'item.enumeration',
    'item.chronology',
    'item.copyNumber',
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

  const columnHeadersMap = headers.map(item => {
    return {
      label: intl.formatMessage({ id: `ui-users.${item}` }),
      value: item
    };
  });

  const renderCheckboxList = () => {
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
  };

  const onDropdownClick = () => {
    setToggleDropdownState(prevToggleDropdownState => !prevToggleDropdownState);
  };

  const noSelectedLoans = isEmpty(checkedLoans);
  const resultCount = intl.formatMessage(
    { id: 'ui-users.resultCount' },
    { count: loans.length },
  );
  const claimedReturnedCount = loans.filter(l => l?.item?.status?.name === itemStatuses.CLAIMED_RETURNED).length;
  const clonedLoans = cloneDeep(loans);
  const recordsToCSV = buildRecords(clonedLoans);
  const countRenews = getRenewalPatronBlocksFromPatronBlocks(patronBlocks);
  const onlyClaimedReturnedItemsSelected = hasEveryLoanItemStatus(checkedLoans, itemStatuses.CLAIMED_RETURNED);
  const onlyLostyItemsSelected = hasAnyLoanItemStatus(checkedLoans, lostItemStatuses);
  const isUserActive = checkUserActive(user);

  return (
    <ActionsBar
      contentStart={
        <span style={{ display: 'flex' }}>
          <span id="loan-count">
            {resultCount}
            {' '}
            {claimedReturnedCount > 0 && intl.formatMessage(
              { id: 'ui-users.loans.numClaimedReturnedLoans' },
              { count: claimedReturnedCount },
            )}
          </span>
          <Dropdown
            id="columnsDropdown"
            data-testid="columnsDropdown"
            className={css.columnsDropdown}
            group
            pullRight
            onToggle={onDropdownClick}
            open={toggleDropdownState}
            label={intl.formatMessage({ id: 'ui-users.selectColumns' })}
            buttonProps={{
              align: 'end',
              bottomMargin0: true,
              'aria-haspopup': true,
            }}
          >
            <DropdownMenu aria-label="available permissions">
              <ul>
                {renderCheckboxList()}
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
              disabled={noSelectedLoans || onlyClaimedReturnedItemsSelected || !isUserActive}
              onClick={!isEmpty(countRenews)
                ? openPatronBlockedModal
                : () => renewSelected()
              }
            >
              {intl.formatMessage({ id: 'ui-users.renew' })}
            </Button>
          </IfPermission>
          <IfPermission perm="ui-users.loans.claim-item-returned">
            <Button
              marginBottom0
              id="bulk-claim-returned"
              disabled={noSelectedLoans || onlyClaimedReturnedItemsSelected}
              onClick={openBulkClaimReturnedModal}
            >
              {intl.formatMessage({ id: 'ui-users.loans.claimReturned' })}
            </Button>
          </IfPermission>
          <IfPermission perm="ui-users.loans.change-due-date">
            <Button
              marginBottom0
              id="change-due-date-all"
              disabled={noSelectedLoans || onlyLostyItemsSelected}
              onClick={showChangeDueDateDialog}
            >
              {intl.formatMessage({ id: 'stripes-smart-components.cddd.changeDueDate' })}
            </Button>
          </IfPermission>
          <ExportCsv
            data={recordsToCSV}
            onlyFields={columnHeadersMap}
          />
        </span>
      }
    />
  );
};

OpenLoansSubHeader.propTypes = {
  buildRecords: PropTypes.func.isRequired,
  checkedLoans: PropTypes.object.isRequired,
  columnMapping: PropTypes.object.isRequired,
  loans: PropTypes.arrayOf(PropTypes.object).isRequired,
  openBulkClaimReturnedModal: PropTypes.func.isRequired,
  openPatronBlockedModal: PropTypes.func.isRequired,
  patronBlocks: PropTypes.arrayOf(PropTypes.object).isRequired,
  renewSelected: PropTypes.func.isRequired,
  showChangeDueDateDialog: PropTypes.func.isRequired,
  toggleColumn: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
  visibleColumns: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default OpenLoansSubHeader;
