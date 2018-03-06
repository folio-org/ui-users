import _ from 'lodash';
import React from 'react';
import Link from 'react-router-dom/Link';
import PropTypes from 'prop-types';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import KeyValue from '@folio/stripes-components/lib/KeyValue';
import MultiColumnList from '@folio/stripes-components/lib/MultiColumnList';
import Pane from '@folio/stripes-components/lib/Pane';
import Paneset from '@folio/stripes-components/lib/Paneset';
import Button from '@folio/stripes-components/lib/Button';
import Callout from '@folio/stripes-components/lib/Callout';

import { formatDateTime, getFullName } from './util';
import loanActionMap from './data/loanActionMap';
import LoanActionsHistoryProxy from './LoanActionsHistoryProxy';
import withRenew from './withRenew';

/**
 * Detail view of a user's loan.
 */
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
    renew: PropTypes.func,
  };

  static manifest = Object.freeze({
    userIds: {},
    loanActionsWithUser: {},
    users: {
      type: 'okapi',
      records: 'users',
      resourceShouldRefresh: true,
      path: 'users?query=(%{userIds.query})',
    },
    loanActions: {
      type: 'okapi',
      records: 'loans',
      resourceShouldRefresh: true,
      GET: {
        path: 'loan-storage/loan-history?query=(id==!{loan.id})',
      },
    },
  });
  // resourceShouldRefresh:function() { return true },
  constructor(props) {
    super(props);
    this.connectedProxy = props.stripes.connect(LoanActionsHistoryProxy);
    this.renew = this.renew.bind(this);

    this.state = {
      loanActionCount: 0,
    };
  }

  // TODO: refactor after join is supported in stripes-connect
  componentWillReceiveProps(nextProps) {
    const { loan, resources: { loanActions, userIds, users, loanActionsWithUser } } = nextProps;

    if (!loanActions.records.length ||
      loanActions.records[0].id !== loan.id) return;
    if (!userIds.query || userIds.loan.id !== loan.id) {
      const query = loanActions.records
        .map(r => `id==${r.metaData.updatedByUserId}`).join(' or ');
      this.props.mutator.userIds.replace({ query, loan });
    }

    if (!users.records.length) return;

    if (!loanActionsWithUser.records || loanActionsWithUser.loan.id !== loan.id
      || this.state.loanActionCount !== loanActions.other.totalRecords) {
      this.joinLoanActionsWithUser(loanActions.records, users.records, loan);
      this.setState({ loanActionCount: loanActions.other.totalRecords });
    }
  }

  joinLoanActionsWithUser(loanActions, users, loan) {
    const userMap = users.reduce((memo, user) =>
      Object.assign(memo, { [user.id]: user }), {});
    const records = loanActions.map(la =>
      Object.assign({}, la, { user: userMap[la.metaData.updatedByUserId] }));
    this.props.mutator.loanActionsWithUser.replace({ loan, records });
  }

  renew() {
    this.props.renew(this.props.loan).then(() => this.showCallout());
  }

  showCallout() {
    const message = (
      <span>
        The loan for <strong>{this.props.loan.item.title}</strong> was successfully <strong>renewed</strong>.
      </span>
    );

    this.callout.sendCallout({ message });
  }

  render() {
    const { onCancel, loan, user, resources: { loanActionsWithUser } } = this.props;
    const loanActionsFormatter = {
      Action: la => loanActionMap[la.action],
      'Action Date': la => formatDateTime(la.loanDate),
      'Due Date': la => formatDateTime(la.dueDate),
      'Item Status': la => la.itemStatus,
      Operator: la => getFullName(la.user),
    };

    return (
      <Paneset isRoot>
        <Pane id="pane-loandetails" defaultWidth="100%" dismissible onClose={onCancel} paneTitle="Loan Details">
          <Row>
            <Col>
              <Button buttonStyle="primary" onClick={this.renew}>Renew</Button>
            </Col>
          </Row>
          <Row>
            <Col xs={4} >
              <KeyValue label="Title" value={_.get(loan, ['item', 'title'], '')} />
            </Col>
            <Col xs={2} >
              <KeyValue label="Barcode" value={<Link to={`/inventory/view/${_.get(loan, ['item', 'instanceId'], '')}/${_.get(loan, ['item', 'holdingsRecordId'], '')}/${_.get(loan, ['itemId'], '')}`}>{_.get(loan, ['item', 'barcode'], '')}</Link>} />
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
              <KeyValue label="Due Date" value={formatDateTime(loan.dueDate) || '-'} />
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
              <KeyValue label="Loan Date" value={formatDateTime(loan.loanDate) || '-'} />
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
              <KeyValue label="Return Date" value={formatDateTime(loan.returnDate) || '-'} />
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
          <Callout ref={(ref) => { this.callout = ref; }} />
        </Pane>
      </Paneset>
    );
  }
}

export default withRenew(LoanActionsHistory);
