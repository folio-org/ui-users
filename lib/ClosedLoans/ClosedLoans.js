import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-bootstrap';
import MultiColumnList from '@folio/stripes-components/lib/MultiColumnList';
import { formatDate, formatDateTime } from '../../util';
import Label from '../Label';

class ClosedLoans extends React.Component {

  static propTypes = {
    stripes: PropTypes.shape({
      locale: PropTypes.string.isRequired,
    }).isRequired,
    history: PropTypes.object.isRequired,
    onClickViewLoanActionsHistory: PropTypes.func.isRequired,
    loans: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
  };

  goToItem(e, itemId) {
    this.props.history.push(`/items/view/${itemId}`);
    e.preventDefault();
  }

  renderSubHeader() {
    const checkedLoans = this.state.checkedLoans;

    return (
      <Row>
        <Col xs={12}>
          <Label>{this.props.loans.length} Records found</Label>
        </Col>
      </Row>
    );
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
      itemStatus: loan => `${_.get(loan, ['item', 'status', 'name'], '')}`,
      loanDate: loan => formatDate(loan.loanDate, stripes.locale),
      dueDate: loan => (loan.dueDate ? formatDateTime(loan.dueDate, stripes.locale) : ''),
      renewals: loan => loan.renewalCount || 0,
      returnDate: loan => (loan.returnDate ? formatDateTime(loan.returnDate, stripes.locale) : ''),
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
