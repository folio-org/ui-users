import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-bootstrap';
import KeyValue from '@folio/stripes-components/lib/KeyValue';
import MultiColumnList from '@folio/stripes-components/lib/MultiColumnList';
import Pane from '@folio/stripes-components/lib/Pane';
import Paneset from '@folio/stripes-components/lib/Paneset';
import fetch from 'isomorphic-fetch';
import { formatDate, futureDate, getFullName } from './util';
import loanActionsMap from './data/loanActionMap';

console.log('loanActionsMap', loanActionsMap);

class LoanActionsHistory extends React.Component {
  static propTypes = {
    stripes: PropTypes.object.isRequired,
    resources: PropTypes.shape({
      loanActions: PropTypes.object,
      loanActionsWithUser: PropTypes.object,
    }).isRequired,
    mutator: PropTypes.shape({
      loanActionsWithUser: PropTypes.shape({
        replace: PropTypes.func,
      }),
    }).isRequired,
    loan: PropTypes.object,
    user: PropTypes.object,
    onCancel: PropTypes.func.isRequired,
  };

  static manifest = Object.freeze({
    loanActionsWithUser: { initialValue: null },
    loanActions: {
      type: 'okapi',
      records: 'loans',
      GET: {
        path: 'loan-storage/loan-history?query=(id=!{loan.id})',
      },
    },
  });

  componentWillReceiveProps(nextProps) {
    const curLoanActions = this.props.resources.loanActions;
    const nextLoanActions = nextProps.resources.loanActions;

    if (curLoanActions && !curLoanActions.hasLoaded && nextLoanActions.records.length) {
      const userIds = nextLoanActions.records.map(r => r.userId);
      this.getUsersByIds(userIds).then(users =>
        this.addUsersToLoanActions(users, nextLoanActions.records));
    }
  }

  getUsersByIds(userIds) {
    const ids = userIds.map(id => `id=${id}`).join(' or ');
    const stripes = this.props.stripes;
    const okapiUrl = stripes.okapi.url;
    const headers = {
      'X-Okapi-Tenant': stripes.okapi.tenant,
      'X-Okapi-Token': stripes.store.getState().okapi.token,
      'Content-Type': 'application/json',
    };

    return fetch(`${okapiUrl}/users?query=(${ids})`, { headers })
      .then(resp => resp.json())
      .then(json => json.users);
  }

  addUsersToLoanActions(users, loanActions) {
    const userMap = users.reduce((memo, user) =>
      Object.assign(memo, { [user.id]: user }), {});
    const records = loanActions.map(la =>
      Object.assign({}, la, { user: userMap[la.userId] }));
    this.props.mutator.loanActionsWithUser.replace({ records });
  }

  render() {
    const { onCancel, loan, user, stripes, resources: { loanActionsWithUser } } = this.props;

    if (!loanActionsWithUser || !loanActionsWithUser.records) return <div />;
    const loanActionsFormatter = {
      Action: la => loanActionsMap[la.action],
      'Action Date': la => formatDate(la.loanDate, stripes.locale),
      'Due Date': la => futureDate(la.loanDate, stripes.locale, 14),
      Operator: () => `${stripes.user.user.lastName} ${stripes.user.user.firstName}`, // TODO: replace with operator after CIRCSTORE-16
    };

    return (
      <Paneset isRoot>
        <Pane id="pane-loandetails" defaultWidth="100%" dismissible onClose={onCancel} paneTitle={'Loan Details'}>
          <Row>
            <Col xs={5} >
              <Row>
                <Col xs={12}>
                  <KeyValue label="Title" value={_.get(loan, ['item', 'title'], '')} />
                </Col>
              </Row>
              <br />
              <Row>
                <Col xs={12}>
                  <KeyValue label="Loan Status" value={_.get(loan, ['status', 'name'], '-')} />
                </Col>
              </Row>
            </Col>
            <Col xs={3} >
              <Row>
                <Col xs={12}>
                  <KeyValue label="Borrower" value={getFullName(user)} />
                </Col>
              </Row>
            </Col>
            <Col xs={4}>
              <Row>
                <Col xs={12}>
                  <KeyValue label="Loan Date" value={formatDate(loan.loanDate, stripes.locale) || '-'} />
                </Col>
              </Row>
              <br />
              <Row>
                <Col xs={12}>
                  <KeyValue label="Due Date" value={futureDate(loan.loanDate, stripes.locale, 14) || '-'} />
                </Col>
              </Row>
            </Col>
          </Row>
          <br />
          <MultiColumnList
            id="list-loanactions"
            formatter={loanActionsFormatter}
            visibleColumns={['Action Date', 'Action', 'Due Date', 'Operator']}
            contentData={loanActionsWithUser.records}
          />
        </Pane>
      </Paneset>
    );
  }
}

export default LoanActionsHistory;
