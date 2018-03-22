import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import MultiColumnList from '@folio/stripes-components/lib/MultiColumnList';
import ActionsBar from '../components/ActionsBar';
import { formatDate, formatDateTime } from '../../../util';
import Label from '../../Label';

const ClosedLoans = (props) => {
  const { loans } = props;

  const loansFormatter = {
    title: loan => _.get(loan, ['item', 'title'], ''),
    barcode: loan => _.get(loan, ['item', 'barcode'], ''),
    itemStatus: loan => `${_.get(loan, ['item', 'status', 'name'], '')}`,
    loanDate: loan => formatDate(loan.loanDate),
    dueDate: loan => formatDateTime(loan.dueDate),
    renewals: loan => loan.renewalCount || 0,
    returnDate: loan => formatDateTime(loan.returnDate),
  };

  const visibleColumns = ['title', 'itemStatus', 'barcode', 'loanDate', 'dueDate', 'returnDate', 'renewals'];
  const columnMapping = {
    loanDate: 'Loan Date',
    dueDate: 'Due Date',
    itemStatus: 'Item Status',
  };

  return (
    <div>
      <ActionsBar
        show={props.loans.length > 0}
        contentStart={<Label>{props.loans.length} Records found</Label>}
      />
      <MultiColumnList
        id="list-loanshistory"
        fullWidth
        formatter={loansFormatter}
        visibleColumns={visibleColumns}
        columnMapping={columnMapping}
        columnOverflow={{ ' ': true }}
        contentData={loans}
        onRowClick={props.onClickViewLoanActionsHistory}
      />
    </div>
  );
};

ClosedLoans.propTypes = {
  onClickViewLoanActionsHistory: PropTypes.func.isRequired,
  loans: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default ClosedLoans;
