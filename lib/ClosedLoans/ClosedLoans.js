import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import MultiColumnList from '@folio/stripes-components/lib/MultiColumnList';
import { formatDate, formatDateTime, getItemStatusFormatter } from '../../util';
import Label from '../Label';

class ClosedLoans extends React.Component {

  static propTypes = {
    stripes: PropTypes.shape({
      intl: PropTypes.object.isRequired,
    }).isRequired,
    history: PropTypes.object.isRequired,
    onClickViewLoanActionsHistory: PropTypes.func.isRequired,
    loans: PropTypes.arrayOf(PropTypes.object).isRequired,
  };

  goToItem(e, itemId) {
    this.props.history.push(`/items/view/${itemId}`);
    e.preventDefault();
  }

  render() {
    const { loans, stripes } = this.props;
    const loanTitleFormatter = (loan, label) => (
      <a
        href={`/items/view/${loan.itemId}`}
        onClick={e => this.goToItem(e, loan.itemId)}
      >{label}</a>
    );

    const loansFormatter = {
      title: loan => loanTitleFormatter(loan, _.get(loan, ['item', 'title'], '')),
      barcode: loan => loanTitleFormatter(loan, _.get(loan, ['item', 'barcode'], '')),
      itemStatus: loan => getItemStatusFormatter(loan),
      loanDate: loan => formatDate(loan.loanDate, stripes.intl),
      dueDate: loan => (loan.dueDate ? formatDateTime(loan.dueDate, stripes.intl) : ''),
      renewals: loan => loan.renewalCount || 0,
      returnDate: loan => (loan.returnDate ? formatDateTime(loan.returnDate, stripes.intl) : ''),
    };

    const visibleColumns = ['title', 'itemStatus', 'barcode', 'loanDate', 'dueDate', 'returnDate', 'renewals'];
    const columnMapping = {
      loanDate: 'Loan Date',
      dueDate: 'Due Date',
      itemStatus: 'Item Status',
    };

    return (
      <div>
        {this.props.loans.length > 0 &&
          <Row>
            <Col xs={12}>
              <Label>{this.props.loans.length} Records found</Label>
            </Col>
          </Row>
        }
        <MultiColumnList
          id="list-loanshistory"
          fullWidth
          formatter={loansFormatter}
          visibleColumns={visibleColumns}
          columnMapping={columnMapping}
          columnOverflow={{ ' ': true }}
          contentData={loans}
          onRowClick={this.props.onClickViewLoanActionsHistory}
        />
      </div>
    );
  }
}

export default ClosedLoans;
