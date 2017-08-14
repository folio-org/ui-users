import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';

import { Row, Col } from 'react-bootstrap';
import Button from '@folio/stripes-components/lib/Button';

class UserLoans extends React.Component {

  static propTypes = {
    resources: PropTypes.shape({
      loansHistory: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }),
    onClickViewOpenLoans: PropTypes.func.isRequired,
    onClickViewClosedLoans: PropTypes.func.isRequired,
  };

  static manifest = Object.freeze({
    loansHistory: {
      type: 'okapi',
      records: 'loans',
      GET: {
        path: 'circulation/loans?query=(userId=:{userid})&limit=100',
      },
    },
    userid: {},
  });

  render() {
    const resources = this.props.resources;
    const loansHistory = (resources.loansHistory || {}).records || [];
    const openLoans = _.filter(loansHistory, loan => _.get(loan, ['status', 'name']) !== 'Closed');
    const closedLoans = _.filter(loansHistory, loan => _.get(loan, ['status', 'name']) === 'Closed');

    if (!loansHistory) return (<div />);

    return (
      <div>
        <Row>
          <Col xs={7} sm={6}>
            <h3 className="marginTop0">Loans</h3>
          </Col>
          <Col xs={5} sm={6}>
            <div style={{ float: 'right' }}>
              <Button id="clickable-viewfullhistory" align="end" bottomMargin0 onClick={this.props.onClickViewOpenLoans}>View Loans</Button>
            </div>
          </Col>
        </Row>
        <ul>
          <li><a id="clickable-viewcurrentloans" href="" onClick={this.props.onClickViewOpenLoans}>{ openLoans.length } Open Loans</a></li>
          <li><a id="clickable-viewclosedloans" href="" onClick={this.props.onClickViewClosedLoans}>{ closedLoans.length } Closed Loans</a></li>
        </ul>
      </div>);
  }
}

export default UserLoans;
