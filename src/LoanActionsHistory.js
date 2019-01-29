import { get, upperFirst, isEmpty } from 'lodash';
import React from 'react';
import {
  FormattedMessage,
  FormattedTime,
  injectIntl,
  intlShape,
} from 'react-intl';
import SafeHTMLMessage from '@folio/react-intl-safe-html';
import Link from 'react-router-dom/Link';
import PropTypes from 'prop-types';
import { ChangeDueDateDialog } from '@folio/stripes/smart-components';
import {
  Paneset,
  Pane,
  Modal,
  Button,
  Popover,
  Callout,
  MultiColumnList,
  KeyValue,
  Row,
  Col,
} from '@folio/stripes/components';
import { IfPermission } from '@folio/stripes/core';
import PatronBlockModal from './components/PatronBlock/PatronBlockModal';
import { getFullName } from './util';
import loanActionMap from './data/loanActionMap';
import LoanActionsHistoryProxy from './LoanActionsHistoryProxy';
import withRenew from './withRenew';

/**
 * Detail view of a user's loan.
 */
class LoanActionsHistory extends React.Component {
  static manifest = Object.freeze({
    loanActionsWithUser: {},
    users: {
      type: 'okapi',
      records: 'users',
      resourceShouldRefresh: true,
      path: 'users',
      accumulate: 'true',
      fetch: false,
    },
    loanPolicies: {
      type: 'okapi',
      records: 'loanPolicies',
      path: 'loan-policy-storage/loan-policies',
      accumulate: 'true',
      fetch: false,
    },
    requests: {
      type: 'okapi',
      path: 'circulation/requests',
      resourceShouldRefresh: true,
      records: 'requests',
      accumulate: 'true',
      fetch: false,
    },
    loanActions: {
      type: 'okapi',
      path: 'loan-storage/loan-history',
      records: 'loans',
      resourceShouldRefresh: true,
      accumulate: 'true',
      fetch: false,
    },
    loanAccountsActions: {
      type: 'okapi',
      records: 'accounts',
      path: 'accounts',
      accumulate: 'true',
      fetch: false,
    },
  });

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
      loanPolicies: PropTypes.shape({
        GET: PropTypes.func,
        reset: PropTypes.func,
      }),
      requests: PropTypes.shape({
        GET: PropTypes.func,
        reset: PropTypes.func,
      }),
      userIds: PropTypes.shape({
        replace: PropTypes.func,
      }),
    }).isRequired,
    loan: PropTypes.object,
    patronGroup: PropTypes.object,
    loanid: PropTypes.string,
    user: PropTypes.object,
    onCancel: PropTypes.func.isRequired,
    onClickUser: PropTypes.func.isRequired,
    onClickViewAllAccounts: PropTypes.func.isRequired,
    onClickViewClosedAccounts: PropTypes.func.isRequired,
    onClickViewOpenAccounts: PropTypes.func.isRequired,
    onClickViewAccountActionsHistory: PropTypes.func.isRequired,
    renew: PropTypes.func,
    intl: intlShape.isRequired,
  };

  constructor(props) {
    super(props);
    this.nav = null;
    this.connectedProxy = props.stripes.connect(LoanActionsHistoryProxy);
    this.connectedChangeDueDateDialog = props.stripes.connect(ChangeDueDateDialog);
    this.renew = this.renew.bind(this);
    this.getContributorslist = this.getContributorslist.bind(this);
    this.showContributors = this.showContributors.bind(this);
    this.hideNonRenewedLoansModal = this.hideNonRenewedLoansModal.bind(this);
    this.showTitle = this.showTitle.bind(this);
    this.showChangeDueDateDialog = this.showChangeDueDateDialog.bind(this);
    this.hideChangeDueDateDialog = this.hideChangeDueDateDialog.bind(this);
    this.getOpenRequestsCount = this.getOpenRequestsCount.bind(this);
    this.getLoanPolicyName = this.getLoanPolicyName.bind(this);
    this.getFeeFine = this.getFeeFine.bind(this);
    this.viewFeeFine = this.viewFeeFine.bind(this);

    this.state = {
      nonRenewedLoanItems: [],
      nonRenewedLoansModalOpen: false,
      changeDueDateDialogOpen: false,
      requestsCount: {},
      loanPolicyName: '',
      feesFines: {},
      patronBlockedModal: false,
    };
  }

  componentDidMount() {
    this.getOpenRequestsCount();
    this.getLoanPolicyName();
    this.getLoanActions();
    this.getFeeFine();
  }

  componentDidUpdate(prevProps) {
    if (this.props.loan.itemId !== prevProps.loan.itemId) {
      this.getOpenRequestsCount();
      this.getLoanPolicyName();
    }
  }

  getContributorslist(loan) {
    this.loan = loan;
    const contributors = get(this.loan, ['item', 'contributors']);
    const contributorsList = [];
    if (typeof contributors !== 'undefined') {
      Object.keys(contributors).forEach(contributor => contributorsList.push(`${contributors[contributor].name}; `));
    } else {
      contributorsList.push('-');
    }
    return contributorsList;
  }

  hideChangeDueDateDialog() {
    this.setState({
      changeDueDateDialogOpen: false,
    });
  }

  hideNonRenewedLoansModal() {
    this.setState({ nonRenewedLoansModalOpen: false });
  }

  joinLoanActionsWithUser(loanActions, users) {
    const userMap = users.reduce((memo, user) => {
      return Object.assign(memo, { [user.id]: user });
    }, {});
    const records = loanActions.map(la => {
      return Object.assign({}, la, { user: userMap[la.metadata.updatedByUserId] });
    });

    this.props.mutator.loanActionsWithUser.replace({ records });
  }

  openNonRenewedLoansModal(nonRenewedLoanItems) {
    this.setState({ nonRenewedLoanItems });
    this.showNonRenewedLoansModal();
  }

  renew() {
    const { loan, user, patronBlocks } = this.props;
    const countRenew = patronBlocks.filter(p => p.renewals);

    if (!isEmpty(countRenew)) return this.setState({ patronBlockedModal: true });

    const promise = this.props.renew(loan, user);
    const singleRenewalFailure = [];

    promise
      .then(() => this.onRenew())
      .catch(() => singleRenewalFailure.push(loan));

    return promise;
  }

  onRenew() {
    this.showCallout();
    this.getLoanActions();
  }

  getUsers(loanActions) {
    const { mutator } = this.props;
    const query = loanActions
      .map(r => `id==${r.metadata.updatedByUserId}`)
      .join(' or ');

    mutator.users.reset();
    mutator.users.GET({ params: { query } })
      .then(users => this.joinLoanActionsWithUser(loanActions, users));
  }

  getLoanActions() {
    const { loanid, mutator, loan } = this.props;
    const query = `id==${loanid || loan.id}`;
    const limit = 100;
    mutator.loanActions.reset();
    mutator.loanActions.GET({ params: { query, limit } })
      .then(loanActions => this.getUsers(loanActions));
  }

  getOpenRequestsCount() {
    const { loan, stripes, mutator } = this.props;

    if (!stripes.hasPerm('ui-users.requests.all')) {
      return;
    }

    const q = `itemId==${loan.itemId}`;
    const query = `(${q}) and status==("Open - Awaiting pickup" or "Open - Not yet filled") sortby requestDate desc`;
    mutator.requests.reset();
    mutator.requests.GET({ params: { query } }).then((requestRecords) => {
      const requestCountObject = requestRecords.reduce((map, record) => {
        map[record.itemId] = map[record.itemId] ? ++map[record.itemId] : 1;
        return map;
      }, {});
      this.setState({ requestsCount: requestCountObject });
    });
  }

  getLoanPolicyName() {
    const { loan, mutator } = this.props;
    const query = `id==${loan.loanPolicyId}`;
    mutator.loanPolicies.reset();
    mutator.loanPolicies.GET({ params: { query } }).then((loanPolicy) => {
      const loanPolicyName = !isEmpty(loanPolicy) ? loanPolicy[0].name : '-';
      this.setState({ loanPolicyName });
    });
  }

  getFeeFine() {
    const { mutator, loan, loanid } = this.props;
    const query = `loanId=${loanid || loan.id}`;

    mutator.loanAccountsActions.GET({ params: { query } }).then(records => {
      const total = records.reduce((a, { amount }) => (a + parseFloat(amount)), 0);
      this.setState({ feesFines: { total, accounts: records } });
    });
  }

  viewFeeFine() {
    const { feesFines: { total } } = this.state;
    return (total === 0) ? '-' : (
      <button
        style={{ color: '#2b75bb' }}
        onClick={(e) => this.feefinedetails(e)}
        type="button"
      >
        {parseFloat(total).toFixed(2)}
      </button>
    );
  }

  feefinedetails = (e) => {
    const { feesFines: { accounts } } = this.state;
    const loan = this.loan || {};
    if (accounts.length === 1) {
      this.props.onClickViewAccountActionsHistory(e, { id: accounts[0].id });
    } else if (accounts.length > 1) {
      const open = accounts.filter(a => a.status.name === 'Open') || [];
      if (open.length === accounts.length) {
        this.props.onClickViewOpenAccounts(e, loan);
      } else if (open.length === 0) {
        this.props.onClickViewClosedAccounts(e, loan);
      } else {
        this.props.onClickViewAllAccounts(e, loan);
      }
    }
  };

  onClosePatronBlockedModal = () => {
    this.setState({ patronBlockedModal: false });
  };

  showCallout() {
    const message = (
      <span>
        <SafeHTMLMessage
          id="ui-users.loans.item.renewed.callout"
          values={{ title: this.props.loan.item.title }}
        />
      </span>
    );

    this.callout.sendCallout({ message });
  }

  showChangeDueDateDialog() {
    this.setState({
      changeDueDateDialogOpen: true,
    });
  }

  showContributors(list, listTodisplay, contributorsLength) {
    this.list = list;
    const contributorsList = <KeyValue
      label={<FormattedMessage id="ui-users.loans.columns.contributors" />}
      value={listTodisplay}
    />;

    return (contributorsLength >= 77) ?
      (
        <Popover>
          <div data-role="target" style={{ cursor: 'pointer' }}>
            {contributorsList}
          </div>
          <div data-role="popover">
            {
              this.list.map(contributor => <p key={contributor}>{contributor}</p>)
            }
          </div>
        </Popover>
      ) : contributorsList;
  }

  showNonRenewedLoansModal() {
    this.setState({ nonRenewedLoansModalOpen: true });
  }

  showTitle(loan) {
    this.loan = loan;
    const title = `${get(this.loan, ['item', 'title'], '')}`;
    if (title) {
      const titleTodisplay = (title.length >= 77) ? `${title.substring(0, 77)}...` : title;
      return <KeyValue
        label={<FormattedMessage id="ui-users.loans.columns.title" />}
        value={(
          <Link to={`/inventory/view/${get(this.loan, ['item', 'instanceId'], '')}`}>
            {`${titleTodisplay} (${get(this.loan, ['item', 'materialType', 'name'])})`}
          </Link>
        )}
      />;
    }
    return '-';
  }

  renderChangeDueDateDialog() {
    return (
      <this.connectedChangeDueDateDialog
        stripes={this.props.stripes}
        loanIds={[{ id: this.props.loan.id }]}
        onClose={this.hideChangeDueDateDialog}
        open={this.state.changeDueDateDialogOpen}
        user={this.props.user}
      />
    );
  }

  render() {
    const {
      onCancel,
      onClickUser,
      loan,
      patronGroup,
      patronBlocks,
      user,
      resources: {
        loanActionsWithUser,
      },
      stripes,
      intl,
    } = this.props;

    const {
      loanPolicyName,
      patronBlockedModal,
    } = this.state;

    if (!loanPolicyName) {
      return <div />;
    }

    const { nonRenewedLoanItems } = this.state;
    const loanActionsFormatter = {
      action: la => <FormattedMessage id={loanActionMap[la.action]} />,
      actionDate: la => <FormattedTime value={get(la, ['metadata', 'updatedDate'], '-')} day="numeric" month="numeric" year="numeric" />,
      dueDate: la => <FormattedTime value={la.dueDate} day="numeric" month="numeric" year="numeric" />,
      itemStatus: la => la.itemStatus,
      source: la => <Link to={`/users/view/${la.user.id}`}>{getFullName(la.user)}</Link>,
      comments: ({ actionComment }) => (actionComment || '-'),
    };

    const requestCount = this.state.requestsCount[this.props.loan.itemId] || 0;
    const requestQueueValue = (requestCount && stripes.hasPerm('ui-users.requests.all,ui-requests.all'))
      ? (<Link to={`/requests?filters=requestStatus.open%20-%20not%20yet%20filled%2CrequestStatus.open%20-%20awaiting%20pickup&query=${loan.item.barcode}&sort=Request%20Date`}>{requestCount}</Link>)
      : requestCount;
    const contributorsList = this.getContributorslist(loan);
    const contributorsListString = contributorsList.join(' ');
    const contributorsLength = contributorsListString.length;
    const loanStatus = get(loan, ['status', 'name'], '-');
    const buttonDisabled = (loanStatus && loanStatus === 'Closed');
    // Number of characters to trucate the string = 77
    const listTodisplay = (contributorsList === '-') ? '-' : (contributorsListString.length >= 77) ? `${contributorsListString.substring(0, 77)}...` : `${contributorsListString.substring(0, contributorsListString.length - 2)}`;
    const nonRenewedLabel = <FormattedMessage id="ui-users.loans.items.nonRenewed.label" />;
    const failedRenewalsSubHeading = (
      <p>
        <FormattedMessage
          id="ui-users.loans.items.nonRenewed.subHeading"
          values={{
            strongCount: <strong>{nonRenewedLoanItems.length}</strong>,
            count: nonRenewedLoanItems.length,
            verb: <strong>{<FormattedMessage id="ui-users.loans.item.nonRenewed.callout.verb" />}</strong>,
          }}
        />
      </p>
    );

    return (
      <Paneset isRoot>
        <Pane
          id="pane-loandetails"
          defaultWidth="100%"
          dismissible
          onClose={onCancel}
          paneTitle={(
            <FormattedMessage id="ui-users.loans.loanDetails">
              {(loanDetails) => `${loanDetails} - ${getFullName(user)} (${upperFirst(patronGroup.group)})`}
            </FormattedMessage>
          )}
        >
          <Row>
            <span>
              <Button
                disabled={buttonDisabled}
                buttonStyle="primary"
                onClick={this.renew}
              >
                <FormattedMessage id="ui-users.renew" />
              </Button>
              <Button
                disabled={buttonDisabled}
                buttonStyle="primary"
                onClick={this.showChangeDueDateDialog}
              >
                <FormattedMessage id="stripes-smart-components.cddd.changeDueDate" />
              </Button>
            </span>
          </Row>
          <Row>
            <Col xs={2}>
              <KeyValue
                label={<FormattedMessage id="ui-users.loans.details.borrower" />}
                value={getFullName(user)}
              />
            </Col>
            <Col xs={2}>
              <this.connectedProxy
                id={loan.proxyUserId}
                onClick={onClickUser}
                {...this.props}
              />
            </Col>
          </Row>
          <Row>
            <Col xs={2}>
              {this.showTitle(loan)}
            </Col>
            <Col xs={2}>
              {this.showContributors(contributorsList, listTodisplay, contributorsLength)}
            </Col>
            <Col xs={2}>
              <KeyValue
                label={<FormattedMessage id="ui-users.loans.columns.barcode" />}
                value={<Link to={`/inventory/view/${get(loan, ['item', 'instanceId'], '')}/${get(loan, ['item', 'holdingsRecordId'], '')}/${get(loan, ['itemId'], '')}`}>{get(loan, ['item', 'barcode'], '')}</Link>}
              />
            </Col>
            <Col xs={2}>
              <KeyValue
                label={<FormattedMessage id="ui-users.loans.details.callNumber" />}
                value={get(loan, ['item', 'callNumber'], '-')}
              />
            </Col>
            <Col xs={2}>
              <KeyValue
                label={<FormattedMessage id="ui-users.loans.details.location" />}
                value={get(loan, ['item', 'location', 'name'], '-')}
              />
            </Col>
          </Row>
          <Row>
            <Col xs={2}>
              <KeyValue
                label={<FormattedMessage id="ui-users.loans.columns.itemStatus" />}
                value={get(loan, ['item', 'status', 'name'], '-')}
              />
            </Col>
            <Col xs={2}>
              <KeyValue
                label={<FormattedMessage id="ui-users.loans.columns.dueDate" />}
                value={loan.dueDate ? (<FormattedTime value={loan.dueDate} day="numeric" month="numeric" year="numeric" />) : '-'}
              />
            </Col>
            <Col xs={2}>
              <KeyValue
                label={<FormattedMessage id="ui-users.loans.columns.returnDate" />}
                value={loan.returnDate ? (<FormattedTime value={loan.returnDate} day="numeric" month="numeric" year="numeric" />) : '-'}
              />
            </Col>
            <Col xs={2}>
              <KeyValue
                label={<FormattedMessage id="ui-users.loans.details.renewalCount" />}
                value={get(loan, ['renewalCount'], '-')}
              />
            </Col>
            <Col xs={2}>
              <KeyValue
                label={<FormattedMessage id="ui-users.loans.details.claimedReturned" />}
                value="TODO"
              />
            </Col>
            <Col xs={2}>
              <KeyValue
                label={<FormattedMessage id="ui-users.loans.details.checkinServicePoint" />}
                value={get(loan, ['checkinServicePoint', 'name'], '-')}
              />
            </Col>
          </Row>
          <Row>
            <Col xs={2}>
              <KeyValue
                label={<FormattedMessage id="ui-users.loans.details.loanPolicy" />}
                value={<Link to={`/settings/circulation/loan-policies/${loan.loanPolicyId}`}>{loanPolicyName}</Link>}
              />
            </Col>
            <Col xs={2}>
              <KeyValue
                label={<FormattedMessage id="ui-users.loans.columns.loanDate" />}
                value={<FormattedTime value={loan.loanDate} day="numeric" month="numeric" year="numeric" /> || '-'}
              />
            </Col>
            <Col xs={2}>
              <KeyValue
                label={<FormattedMessage id="ui-users.loans.details.fine" />}
                value={this.viewFeeFine()}
              />
            </Col>
            <IfPermission perm="ui-users.requests.all">
              <Col xs={2}>
                <KeyValue
                  label={<FormattedMessage id="ui-users.loans.details.requestQueue" />}
                  value={requestQueueValue}
                />
              </Col>
            </IfPermission>
            <Col xs={2}>
              <KeyValue
                label={<FormattedMessage id="ui-users.loans.details.lost" />}
                value="TODO"
              />
            </Col>
          </Row>
          <br />
          {loanActionsWithUser && loanActionsWithUser.records &&
            <MultiColumnList
              id="list-loanactions"
              formatter={loanActionsFormatter}
              visibleColumns={['actionDate', 'action', 'dueDate', 'itemStatus', 'source', 'comments']}
              columnMapping={{
                action: intl.formatMessage({ id: 'ui-users.loans.columns.action' }),
                actionDate: intl.formatMessage({ id: 'ui-users.loans.columns.actionDate' }),
                dueDate: intl.formatMessage({ id: 'ui-users.loans.columns.dueDate' }),
                itemStatus: intl.formatMessage({ id: 'ui-users.loans.columns.itemStatus' }),
                source: intl.formatMessage({ id: 'ui-users.loans.columns.source' }),
                comments: intl.formatMessage({ id: 'ui-users.loans.columns.comments' }),
              }}
              contentData={loanActionsWithUser.records}
            />
          }
          <Modal dismissible closeOnBackgroundClick onClose={this.hideNonRenewedLoansModal} open={this.state.nonRenewedLoansModalOpen} label={nonRenewedLabel}>
            {failedRenewalsSubHeading}
            {
                nonRenewedLoanItems.map((loanItem, index) => (
                  <li key={index}>
                    <span>{loanItem.item.title}</span>
                  </li>))
            }
          </Modal>
          <PatronBlockModal
            open={patronBlockedModal}
            onClose={this.onClosePatronBlockedModal}
            patronBlocks={patronBlocks}
            viewUserPath={`/users/view/${(user || {}).id}?filters=pg.${patronGroup.group}&sort=Name`}
          />
          { this.renderChangeDueDateDialog() }
          <Callout ref={(ref) => { this.callout = ref; }} />
        </Pane>
      </Paneset>
    );
  }
}

export default withRenew(injectIntl(LoanActionsHistory));
