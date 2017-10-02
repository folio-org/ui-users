import _ from 'lodash';
import React from 'react';
import Link from 'react-router-dom/Link';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-bootstrap';
import KeyValue from '@folio/stripes-components/lib/KeyValue';
import MultiColumnList from '@folio/stripes-components/lib/MultiColumnList';
import Pane from '@folio/stripes-components/lib/Pane';
import Paneset from '@folio/stripes-components/lib/Paneset';
import fetch from 'isomorphic-fetch';

import { formatDateTime, getFullName } from './util';
import loanActionMap from './data/loanActionMap';

class LoanActionsHistory extends React.Component {
  static propTypes = {
    stripes: PropTypes.object.isRequired,
    resources: PropTypes.shape({
      loanActionsWithUser: PropTypes.object,
      userIds: PropTypes.object,
    }).isRequired,
    mutator: PropTypes.shape({
      loanActionsWithUser: PropTypes.shape({
        replace: PropTypes.func,
      }),
      userIds: PropTypes.shape({
        replace: PropTypes.func,
      }),
    }).isRequired,
    loan: PropTypes.object,
    user: PropTypes.object,
    onCancel: PropTypes.func.isRequired,
  };

  static manifest = Object.freeze({
    userIds: {},
    loanActionsWithUser: {},
  });

  constructor(props) {
    super(props);
    const stripes = props.stripes;
    this.okapiUrl = stripes.okapi.url;
    this.httpOptions = {
      headers: {
        'X-Okapi-Tenant': stripes.okapi.tenant,
        'X-Okapi-Token': stripes.store.getState().okapi.token,
        'Content-Type': 'application/json',
      },
    };
  }

  componentWillMount() {
    this.fetchLoanHistory()
      .then(loans => this.findUsers(loans))
      .then(this.joinLoanActionsWithUsers.bind(this));
  }

  // eslint-disable-next-line class-methods-use-this
  handleResponse(resp, message) {
    if (resp.status >= 400) {
      throw new Error(message);
    }
    return resp.json();
  }

  fetchLoanHistory() {
    const loan = this.props.loan;
    return fetch(`${this.okapiUrl}/loan-storage/loan-history?query=(id=${loan.id})`, this.httpOptions)
      .then(resp => this.handleResponse(resp, 'Loan history not found'))
      .then(json => json.loans);
  }

  findUsers(loans) {
    const query = loans.map(l => `id=${l.metaData.createdByUserId}`).join(' or ');
    return fetch(`${this.okapiUrl}/users?query=(${query})`, this.httpOptions)
      .then(resp => this.handleResponse(resp, 'Users not found'))
      .then(json => ({ users: json.users, loans }));
  }

  joinLoanActionsWithUsers({ users, loans }) {
    const userMap = users.reduce((memo, user) =>
      Object.assign(memo, { [user.id]: user }), {});
    const records = loans.map(la =>
      Object.assign({}, la, { user: userMap[la.metaData.createdByUserId] }));
    this.props.mutator.loanActionsWithUser.replace({ records });
  }

  render() {
    const { onCancel, loan, user, stripes, resources: { loanActionsWithUser } } = this.props;
    const loanActionsFormatter = {
      Action: la => loanActionMap[la.action],
      'Action Date': la => formatDateTime(la.loanDate, stripes.locale),
      'Due Date': la => (la.dueDate ? formatDateTime(la.dueDate, stripes.locale) : ''),
      Operator: la => getFullName(la.user),
    };

    return (
      <Paneset isRoot>
        <Pane id="pane-loandetails" defaultWidth="100%" dismissible onClose={onCancel} paneTitle={'Loan Details'}>
          <Row>
            <Col xs={4} >
              <KeyValue label="Title" value={_.get(loan, ['item', 'title'], '')} />
            </Col>
            <Col xs={2} >
              <KeyValue label="Barcode" value={<Link to={`/items/view/${_.get(loan, ['itemId'], '')}?query=${_.get(loan, ['item', 'barcode'], '')}`}>{_.get(loan, ['item', 'barcode'], '')}</Link>} />
            </Col>
            <Col xs={2} >
              <KeyValue label="Item Status" value={_.get(loan, ['item', 'status', 'name'], '-')} />
            </Col>
            <Col xs={2} >
              <KeyValue label="Location" value={_.get(loan, ['item', 'location', 'name'], '-')} />
            </Col>
            <Col xs={2} >
              <KeyValue label="Request Queue" value="TODO" />
            </Col>
          </Row>
          <Row>
            <Col xs={4} >
              <KeyValue label="Authors" value="TODO" />
            </Col>
            <Col xs={2} >
              <KeyValue label="Call Number" value="TODO" />
            </Col>
            <Col xs={2} >
              <KeyValue label="Due Date" value={formatDateTime(loan.dueDate, stripes.locale) || '-'} />
            </Col>
            <Col xs={2} >
              <KeyValue label="Claimed Returned" value="TODO" />
            </Col>
          </Row>
          <Row>
            <Col xs={4} >
              <KeyValue label="Borrower" value={getFullName(user)} />
            </Col>
            <Col xs={2} >
              <KeyValue label="Loan Policy" value="TODO" />
            </Col>
            <Col xs={2} >
              <KeyValue label="Loan Date" value={formatDateTime(loan.loanDate, stripes.locale) || '-'} />
            </Col>
            <Col xs={2} >
              <KeyValue label="Lost" value="TODO" />
            </Col>
          </Row>
          <Row>
            <Col xs={4} >
              <KeyValue label="Proxy Borrower" value="TODO" />
            </Col>
            <Col xs={2} >
              <KeyValue label="Renewal Count" value={_.get(loan, ['renewalCount'], '-')} />
            </Col>
            <Col xs={2} >
              <KeyValue label="Return Date" value={formatDateTime(loan.returnDate, stripes.locale) || '-'} />
            </Col>
            <Col xs={2} >
              <KeyValue label="Fine" value="TODO" />
            </Col>
          </Row>
          <br />
          {loanActionsWithUser && loanActionsWithUser.records &&
            <MultiColumnList
              id="list-loanactions"
              formatter={loanActionsFormatter}
              visibleColumns={['Action Date', 'Action', 'Due Date', 'Operator']}
              columnMapping={loanActionMap}
              contentData={loanActionsWithUser.records}
            />
          }
        </Pane>
      </Paneset>
    );
  }
}

export default LoanActionsHistory;
