import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-bootstrap';
import KeyValue from '@folio/stripes-components/lib/KeyValue';
import MultiColumnList from '@folio/stripes-components/lib/MultiColumnList';
import Pane from '@folio/stripes-components/lib/Pane';
import Paneset from '@folio/stripes-components/lib/Paneset';
import { formatDate, formatDateTime, getFullName } from './util';
import loanActionMap from './data/loanActionMap';

class LoanActionsHistory extends React.Component {
  static propTypes = {
    stripes: PropTypes.object.isRequired,
    resources: PropTypes.shape({
      loanActions: PropTypes.object,
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
    users: {
      type: 'okapi',
      records: 'users',
      path: 'users?query=(%{userIds.query})',
    },
    loanActions: {
      type: 'okapi',
      records: 'loans',
      GET: {
        path: 'loan-storage/loan-history?query=(id=!{loan.id})',
      },
    },
  });

  // TODO refactor after join is supported
  componentWillReceiveProps(nextProps) {
    const { loan, resources: { loanActions, userIds, users, loanActionsWithUser } } = nextProps;

    if (!loanActions.records.length ||
      loanActions.records[0].id !== loan.id) return;

    if (!userIds.query || userIds.loan.id !== loan.id) {
      const query = loanActions.records.map(r => `id=${r.userId}`).join(' or ');
      this.props.mutator.userIds.replace({ query, loan });
    }

    if (!users.records.length) return;

    if (!loanActionsWithUser.records || loanActionsWithUser.loan.id !== loan.id) {
      this.joinLoanActionsWithUser(loanActions.records, users.records, loan);
    }
  }

  joinLoanActionsWithUser(loanActions, users, loan) {
    const userMap = users.reduce((memo, user) =>
      Object.assign(memo, { [user.id]: user }), {});
    const records = loanActions.map(la =>
      Object.assign({}, la, { user: userMap[la.userId] }));
    this.props.mutator.loanActionsWithUser.replace({ loan, records });
  }

  render() {
    const { onCancel, loan, user, stripes, resources: { loanActionsWithUser } } = this.props;
    const loanActionsFormatter = {
      Action: la => loanActionMap[la.action],
      'Action Date': la => formatDateTime(la.loanDate, stripes.locale),
      'Due Date': la => (la.dueDate ? formatDate(la.dueDate, stripes.locale) : ''),
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
                  <KeyValue label="Loan Date" value={formatDateTime(loan.loanDate, stripes.locale) || '-'} />
                </Col>
              </Row>
              <br />
              <Row>
                <Col xs={12}>
                  <KeyValue label="Due Date" value={formatDate(loan.dueDate, stripes.locale) || '-'} />
                </Col>
              </Row>
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
