import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';

import { Row, Col } from 'react-bootstrap';
import Button from '@folio/stripes-components/lib/Button';
import MultiColumnList from '@folio/stripes-components/lib/MultiColumnList';


class UserLoans extends React.Component {

  static propTypes = {
    data: PropTypes.shape({
      userLoans: PropTypes.arrayOf(PropTypes.object),
      loansHistory: PropTypes.arrayOf(PropTypes.object),
    }),
    stripes: PropTypes.shape({
      locale: PropTypes.string.isRequired,
    }).isRequired,
    onClickViewLoansHistory: PropTypes.func.isRequired,
    onClickViewLoanActionsHistory: PropTypes.func.isRequired,
  };

  static manifest = Object.freeze({
    usersLoans: {
      type: 'okapi',
      records: 'loans',
      GET: {
        path: 'circulation/loans?query=(userId=:{userid} AND status="Open")',
      },
    },
    userid: {},
  });

  render() {
    const { data: { usersLoans } } = this.props;

    const loansFormatter = {
      title: loan => `${_.get(loan, ['item', 'title'], '')}`,
      barcode: loan => `${_.get(loan, ['item', 'barcode'], '')}`,
      status: loan => `${_.get(loan, ['status', 'name'], '')}`,
      loanDate: loan => new Date(Date.parse(loan.loanDate)).toLocaleDateString(this.props.stripes.locale),
    };

    if (!usersLoans) return <div />;

    return (
      <div>
        <Row>
          <Col xs={7} sm={6}>
            <h3 className="marginTopHalf">Loans</h3>
          </Col>
          <Col xs={5} sm={6}>
            <Button id="button-viewfullhistory" align="end" bottomMargin0 onClick={this.props.onClickViewLoansHistory}>View Full History</Button>
          </Col>
        </Row>
        <MultiColumnList
          id="list-usersloans"
          fullWidth
          formatter={loansFormatter}
          visibleColumns={['title', 'barcode', 'loanDate', 'status']}
          onRowClick={this.props.onClickViewLoanActionsHistory}
          contentData={usersLoans}
        />
      </div>);
  }
}

export default UserLoans;
