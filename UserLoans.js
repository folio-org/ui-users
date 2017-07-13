import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';

import { Row, Col } from 'react-bootstrap';
import Button from '@folio/stripes-components/lib/Button';


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
    onClickViewOpenLoans: PropTypes.func.isRequired,
    onClickViewClosedLoans: PropTypes.func.isRequired,
  };

  static manifest = Object.freeze({
    loansHistory: {
      type: 'okapi',
      records: 'loans',
      GET: {
        path: 'circulation/loans?query=(userId=:{userid})',
      },
    },
    userid: {},
  });

  render() {
    const { data: { loansHistory } } = this.props;
    const openLoans = _.filter(loansHistory, loan => _.get(loan, ['status', 'name']) === 'Open');
    const closedLoans = _.filter(loansHistory, loan => _.get(loan, ['status', 'name']) === 'Closed');

    if (!loansHistory) return <div />;

    return (
      <div>
        <Row>
          <Col xs={7} sm={6}>
            <h3 className="marginTopHalf">Loans</h3>
          </Col>
          <Col xs={5} sm={6}>
            <Button id="button-viewfullhistory" align="end" bottomMargin0 onClick={this.props.onClickViewLoansHistory}>View Loans</Button>
          </Col>
        </Row>
        <ul>
          <li><Button id="button-viewcurrentloans" onClick={this.props.onClickViewOpenLoans}>{ openLoans.length } Current Loans</Button></li>
          <li><Button id="button-viewclosedloans" onClick={this.props.onClickViewClosedLoans}>{ closedLoans.length } Past Loans</Button></li>
        </ul>
      </div>);
  }
}

export default UserLoans;
