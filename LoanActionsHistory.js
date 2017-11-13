import _ from 'lodash';
import React from 'react';
import Link from 'react-router-dom/Link';
import PropTypes from 'prop-types';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import KeyValue from '@folio/stripes-components/lib/KeyValue';
import MultiColumnList from '@folio/stripes-components/lib/MultiColumnList';
import Pane from '@folio/stripes-components/lib/Pane';
import Paneset from '@folio/stripes-components/lib/Paneset';
import { formatDateTime, getFullName, getItemStatusFormatter } from './util';
import loanActionMap from './data/loanActionMap';
import LoanActionsHistoryProxy from './LoanActionsHistoryProxy';

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
    onClickUser: PropTypes.func.isRequired,
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

  constructor(props) {
    super(props);
    this.connectedProxy = props.stripes.connect(LoanActionsHistoryProxy);
  }

  // TODO: refactor after join is supported in stripes-connect
  componentWillReceiveProps(nextProps) {
    const { loan, resources: { loanActions, userIds, users, loanActionsWithUser } } = nextProps;

    if (!loanActions.records.length ||
      loanActions.records[0].id !== loan.id) return;

    if (!userIds.query || userIds.loan.id !== loan.id) {
      const query = loanActions.records
        .map(r => `id=${r.metaData.createdByUserId}`).join(' or ');
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
      Object.assign({}, la, { user: userMap[la.metaData.createdByUserId] }));
    this.props.mutator.loanActionsWithUser.replace({ loan, records });
  }

  render() {
    const { onCancel, loan, user, stripes, resources: { loanActionsWithUser } } = this.props;
    const loanActionsFormatter = {
      Action: la => loanActionMap[la.action],
      'Action Date': la => formatDateTime(la.loanDate, stripes.locale),
      'Due Date': la => (la.dueDate ? formatDateTime(la.dueDate, stripes.locale) : ''),
      'Item Status': la => getItemStatusFormatter({ action: la.action, item: loan.item }),
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
              <this.connectedProxy id={loan.proxyUserId} onClick={this.props.onClickUser} />
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
              visibleColumns={['Action Date', 'Action', 'Due Date', 'Item Status', 'Operator']}
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
