import _ from 'lodash';
import React from 'react';
import { FormattedMessage } from 'react-intl';
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
    patronGroup: PropTypes.object,
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
      <FormattedMessage
        id="loans.item.renewed.callout"
        values={{
          title: <strong>{this.props.loan.item.title}</strong>,
          verb: <strong>{this.props.stripes.intl.formatMessage({ id: 'loans.item.renewed.callout.verb' })}</strong>,
        }}
      />
    );

    this.callout.sendCallout({ message });
  }

  render() {
    const { onCancel, loan, user, patronGroup, resources: { loanActionsWithUser }, stripes: { intl } } = this.props;
    const loanActionsFormatter = {
      action: la => intl.formatMessage({ id: loanActionMap[la.action] }),
      actionDate: la => formatDateTime(la.loanDate),
      dueDate: la => formatDateTime(la.dueDate),
      itemStatus: la => la.itemStatus,
      operator: la => getFullName(la.user),
    };

    return (
      <Paneset isRoot>
        <Pane id="pane-loandetails" defaultWidth="100%" dismissible onClose={onCancel} paneTitle={`${this.props.stripes.intl.formatMessage({ id: 'ui-users.loans.details.borrower' })}: ${getFullName(user)} (${_.upperFirst(patronGroup.group)})`}>
          <Row>
            <Col>
              <Button buttonStyle="primary" onClick={this.renew}>Renew</Button>
            </Col>
          </Row>
          <Row>
            <Col xs={4} >
              <KeyValue label={intl.formatMessage({ id: 'ui-users.loans.columns.title' })} value={_.get(loan, ['item', 'title'], '')} />
            </Col>
            <Col xs={2} >
              <KeyValue label={intl.formatMessage({ id: 'ui-users.loans.columns.barcode' })} value={<Link to={`/inventory/view/${_.get(loan, ['item', 'instanceId'], '')}/${_.get(loan, ['item', 'holdingsRecordId'], '')}/${_.get(loan, ['itemId'], '')}`}>{_.get(loan, ['item', 'barcode'], '')}</Link>} />
            </Col>
            <Col xs={2} >
              <KeyValue label={intl.formatMessage({ id: 'ui-users.loans.columns.itemStatus' })} value={_.get(loan, ['item', 'status', 'name'], '-')} />
            </Col>
            <Col xs={2} >
              <KeyValue label={intl.formatMessage({ id: 'ui-users.loans.details.location' })} value={_.get(loan, ['item', 'location', 'name'], '-')} />
            </Col>
            <Col xs={2} >
              <KeyValue label={intl.formatMessage({ id: 'ui-users.loans.details.requestQueue' })} value="TODO" />
            </Col>
          </Row>
          <Row>
            <Col xs={4} >
              <KeyValue label={intl.formatMessage({ id: 'ui-users.loans.details.authors' })} value="TODO" />
            </Col>
            <Col xs={2} >
              <KeyValue label={intl.formatMessage({ id: 'ui-users.loans.details.callNumber' })} value="TODO" />
            </Col>
            <Col xs={2} >
              <KeyValue label={intl.formatMessage({ id: 'ui-users.loans.columns.dueDate' })} value={formatDateTime(loan.dueDate) || '-'} />
            </Col>
            <Col xs={2} >
              <KeyValue label={intl.formatMessage({ id: 'ui-users.loans.details.claimedReturned' })} value="TODO" />
            </Col>
          </Row>
          <Row>
            <Col xs={4} >
              <KeyValue label={intl.formatMessage({ id: 'ui-users.loans.details.borrower' })} value={getFullName(user)} />
            </Col>
            <Col xs={2} >
              <KeyValue label={intl.formatMessage({ id: 'ui-users.loans.details.loanPolicy' })} value="TODO" />
            </Col>
            <Col xs={2} >
              <KeyValue label={intl.formatMessage({ id: 'ui-users.loans.columns.loanDate' })} value={formatDateTime(loan.loanDate) || '-'} />
            </Col>
            <Col xs={2} >
              <KeyValue label={intl.formatMessage({ id: 'ui-users.loans.details.lost' })} value="TODO" />
            </Col>
          </Row>
          <Row>
            <Col xs={4} >
              <this.connectedProxy id={loan.proxyUserId} onClick={this.props.onClickUser} />
            </Col>
            <Col xs={2} >
              <KeyValue label={intl.formatMessage({ id: 'ui-users.loans.details.renewalCount' })} value={_.get(loan, ['renewalCount'], '-')} />
            </Col>
            <Col xs={2} >
              <KeyValue label={intl.formatMessage({ id: 'ui-users.loans.columns.returnDate' })} value={formatDateTime(loan.returnDate) || '-'} />
            </Col>
            <Col xs={2} >
              <KeyValue label={intl.formatMessage({ id: 'ui-users.loans.details.fine' })} value="TODO" />
            </Col>
          </Row>
          <br />
          {loanActionsWithUser && loanActionsWithUser.records &&
            <MultiColumnList
              id="list-loanactions"
              formatter={loanActionsFormatter}
              visibleColumns={['action', 'actionDate', 'dueDate', 'itemStatus', 'operator']}
              columnMapping={{
                action: intl.formatMessage({ id: 'ui-users.loans.columns.action' }),
                actionDate: intl.formatMessage({ id: 'ui-users.loans.columns.actionDate' }),
                dueDate: intl.formatMessage({ id: 'ui-users.loans.columns.dueDate' }),
                itemStatus: intl.formatMessage({ id: 'ui-users.loans.columns.itemStatus' }),
                operator: intl.formatMessage({ id: 'ui-users.loans.columns.operator' }),
              }}
              contentData={loanActionsWithUser.records}
            />
          }
          <Callout ref={(ref) => { this.callout = ref; }} />
        </Pane>
      </Paneset>
    );
  }
}
// visibleColumns={['Action Date', 'Action', 'Due Date', 'Item Status', 'Operator']}
export default withRenew(LoanActionsHistory);
