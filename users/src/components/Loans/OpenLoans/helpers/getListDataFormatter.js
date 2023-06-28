import React from 'react';
import { get } from 'lodash';
import {
  FormattedTime,
  FormattedDate,
} from 'react-intl';

import { effectiveCallNumber } from '@folio/stripes/util';

import ActionsDropdown from '../components/ActionsDropdown/ActionsDropdown';
import ContributorsView from '../components/ContributorsView/ContributorsView';

export default function getListDataFormatter(
  formatMessage,
  toggleItem,
  isLoanChecked,
  requestRecords,
  requestCounts,
  resources,
  getLoanPolicy,
  handleOptionsChange,
  stripes,
  getFeeFine,
  getContributorslist,
  feeFineCount,
  user,
) {
  return {
    '  ' : {
      key : '  ',
      formatter: loan => (
        <input
          checked={isLoanChecked(loan.id)}
          onClick={e => toggleItem(e, loan)}
          onChange={e => toggleItem(e, loan)}
          type="checkbox"
          aria-label={formatMessage({ id: 'ui-users.loans.rows.select' })}
        />
      ),
    },
    'title': {
      key: 'title',
      view: formatMessage({ id: 'ui-users.loans.columns.title' }),
      formatter:  loan => {
        const title = get(loan, ['item', 'title'], '');
        if (title) {
          const titleToDisplay = (title.length >= 77) ? `${title.substring(0, 77)}...` : title;
          return `${titleToDisplay} (${get(loan, ['item', 'materialType', 'name'])})`;
        }
        return '-';
      },
      sorter: loan => get(loan, ['item', 'title']),
    },
    'itemStatus': {
      key: 'itemStatus',
      view: formatMessage({ id: 'ui-users.loans.columns.itemStatus' }),
      formatter:  loan => `${get(loan, ['item', 'status', 'name'], '')}`,
      sorter: loan => get(loan, ['item', 'status', 'name'], ''),
    },
    'barcode': {
      key: 'barcode',
      view: formatMessage({ id: 'ui-users.loans.columns.barcode' }),
      formatter: loan => get(loan, ['item', 'barcode'], ''),
      sorter: loan => get(loan, ['item', 'barcode']),
    },
    'feefineIncurred': {
      key:'feefineIncurred',
      view: formatMessage({ id: 'ui-users.loans.columns.feefineIncurred' }),
      formatter:  loan => (<div data-test-feefine-incurred>{getFeeFine(loan, resources)}</div>),
      sorter: loan => getFeeFine(loan, resources),
    },
    'loanDate': {
      key:'loanDate',
      view: formatMessage({ id: 'ui-users.loans.columns.loanDate' }),
      formatter: loan => (<FormattedDate value={loan.loanDate} />),
      sorter: loan => loan.loanDate,
    },
    'requests': {
      key:'requests',
      view: formatMessage({ id: 'ui-users.loans.details.requests' }),
      formatter: loan => (<div data-test-list-requests>{requestCounts[loan.itemId] || 0}</div>),
      sorter:  loan => requestCounts[loan.itemId] || 0,
    },
    'callNumber': {
      key:'callNumber',
      view: formatMessage({ id: 'ui-users.loans.details.effectiveCallNumber' }),
      formatter: loan => (<div data-test-list-call-numbers>{effectiveCallNumber(loan)}</div>),
    },
    'loanPolicy': {
      key:'loanPolicy',
      view: formatMessage({ id: 'ui-users.loans.details.loanPolicy' }),
      formatter: loan => getLoanPolicy(loan.loanPolicyId),
      sorter: loan => getLoanPolicy(loan.loanPolicyId),
    },
    'contributors': {
      key:'Contributors',
      view: formatMessage({ id: 'ui-users.loans.columns.contributors' }),
      formatter: loan => {
        // eslint-disable-next-line react/no-this-in-sfc
        return (<ContributorsView contributorsList={getContributorslist(loan)} />);
      },
      sorter: loan => {
        const contributorsList = getContributorslist(loan);
        return contributorsList.join(' ');
      },
    },
    'dueDate': {
      key:'dueDate',
      view: formatMessage({ id: 'ui-users.loans.columns.dueDate' }),
      formatter: loan => (
        <FormattedTime
          value={get(loan, ['dueDate'])}
          day="numeric"
          month="numeric"
          year="numeric"
        />
      ),
      sorter: loan => loan.dueDate,
    },
    'renewals': {
      key:'renewals',
      view: formatMessage({ id: 'ui-users.loans.columns.renewals' }),
      formatter: loan => loan.renewalCount || 0,
      sorter: loan => loan.renewalCount,
    },
    'location': {
      key:'location',
      view: formatMessage({ id: 'ui-users.loans.details.location' }),
      formatter: loan => `${get(loan, ['item', 'location', 'name'], '')}`,
      sorter: loan => get(loan, ['item', 'location', 'name'], ''),
    },
    ' ': {
      key: ' ',
      view: formatMessage({ id: 'ui-users.action' }),
      formatter: (loan) => {
        let requestQueue = false;

        if (requestRecords.length > 0) {
          requestRecords.forEach(r => {
            if (r.itemId === loan.itemId) requestQueue = true;
          });
        }
        const disableFeeFineDetails = (feeFineCount(loan) === 0);
        const itemRequestCount = requestCounts[loan.itemId] || 0;

        return (
          <div data-test-actions-dropdown>
            <ActionsDropdown
              stripes={stripes}
              loan={loan}
              requestQueue={requestQueue}
              itemRequestCount={itemRequestCount}
              disableFeeFineDetails={disableFeeFineDetails}
              handleOptionsChange={handleOptionsChange}
              user={user}
            />
          </div>
        );
      },
    }
  };
}
