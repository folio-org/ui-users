import _ from 'lodash';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import MultiColumnList from '@folio/stripes-components/lib/MultiColumnList';
import ActionsBar from '../components/ActionsBar';
import Label from '../../Label';

const ClosedLoans = (props) => {
  const { loans, stripes } = props;
  const { formatDate, formatDateTime } = stripes;

  const loansFormatter = {
    title: loan => _.get(loan, ['item', 'title'], ''),
    barcode: loan => _.get(loan, ['item', 'barcode'], ''),
    itemStatus: loan => `${_.get(loan, ['item', 'status', 'name'], '')}`,
    loanDate: loan => formatDate(loan.loanDate),
    dueDate: loan => formatDateTime(loan.dueDate),
    renewals: loan => loan.renewalCount || 0,
    returnDate: loan => formatDateTime(loan.systemReturnDate),
  };

  const visibleColumns = ['title', 'itemStatus', 'barcode', 'loanDate', 'dueDate', 'returnDate', 'renewals'];
  const columnMapping = {
    title: <FormattedMessage id="ui-users.loans.columns.title" />,
    itemStatus: <FormattedMessage id="ui-users.loans.columns.itemStatus" />,
    barcode: <FormattedMessage id="ui-users.loans.columns.barcode" />,
    loanDate: <FormattedMessage id="ui-users.loans.columns.loanDate" />,
    dueDate: <FormattedMessage id="ui-users.loans.columns.dueDate" />,
    returnDate: <FormattedMessage id="ui-users.loans.columns.returnDate" />,
    renewals: <FormattedMessage id="ui-users.loans.columns.renewals" />,
  };

  return (
    <div>
      <ActionsBar
        show={props.loans.length > 0}
        contentStart={<Label>{props.stripes.intl.formatMessage({ id: 'ui-users.resultCount' }, { count: props.loans.length })}</Label>}
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
  stripes: PropTypes.shape({
    intl: PropTypes.object.isRequired,
    formatDate: PropTypes.func.isRequired,
    formatDateTime: PropTypes.func.isRequired,
  }).isRequired,
};

export default ClosedLoans;
