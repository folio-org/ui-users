import _ from 'lodash';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import Link from 'react-router-dom/Link';
import PropTypes from 'prop-types';
import { ChangeDueDateDialog } from '@folio/stripes/smart-components';
import { Popover } from '@folio/stripes/components';
import { Row, Col } from '@folio/stripes/components';
import { Modal } from '@folio/stripes/components';
import { KeyValue } from '@folio/stripes/components';
import { MultiColumnList } from '@folio/stripes/components';
import { Pane } from '@folio/stripes/components';
import { Paneset } from '@folio/stripes/components';
import { Button } from '@folio/stripes/components';
import { Callout } from '@folio/stripes/components';
import SafeHTMLMessage from '@folio/react-intl-safe-html';
import { getFullName } from './util';
import loanActionMap from './data/loanActionMap';
import LoanActionsHistoryProxy from './LoanActionsHistoryProxy';
import withRenew from './withRenew';

/**
 * Detail view of a user's loan.
 */
class LoanActionsHistory extends React.Component {
  static manifest = Object.freeze({
    userIds: {},
    loanActionsWithUser: {},
    // this is another hack used to refresh loanActions after renew is executed
    timestamp: { initialValue: { time: Date.now() } },
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
        path: 'loan-storage/loan-history?query=(id==!{loanid})&timestamp=%{timestamp.time}',
      },
    },
    loanAccountsActions: {
      type: 'okapi',
      records: 'accounts',
      path: 'accounts?query=loanId=!{loanid}&limit=50',
    },
  });

  static propTypes = {
    stripes: PropTypes.object.isRequired,
    resources: PropTypes.shape({
      loanActions: PropTypes.object,
      loanActionsWithUser: PropTypes.object,
      userIds: PropTypes.object,
      timestamp: PropTypes.object,
    }).isRequired,
    mutator: PropTypes.shape({
      loanActionsWithUser: PropTypes.shape({
        replace: PropTypes.func,
      }),
      userIds: PropTypes.shape({
        replace: PropTypes.func,
      }),
      timestamp: PropTypes.shape({
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
  };

  constructor(props) {
    super(props);
    this.nav = null;
    this.connectedProxy = props.stripes.connect(LoanActionsHistoryProxy);
    this.connectedChangeDueDateDialog = props.stripes.connect(ChangeDueDateDialog);
    this.renew = this.renew.bind(this);
    this.getContributorslist = this.getContributorslist.bind(this);
    this.showContributors = this.showContributors.bind(this);
    this.formatDateTime = this.props.stripes.formatDateTime;
    this.hideNonRenewedLoansModal = this.hideNonRenewedLoansModal.bind(this);
    this.showTitle = this.showTitle.bind(this);
    this.showChangeDueDateDialog = this.showChangeDueDateDialog.bind(this);
    this.hideChangeDueDateDialog = this.hideChangeDueDateDialog.bind(this);

    this.state = {
      loanActionCount: 0,
      nonRenewedLoanItems: [],
      nonRenewedLoansModalOpen: false,
      changeDueDateDialogOpen: false,
    };
  }

  // TODO: refactor after join is supported in stripes-connect
  static getDerivedStateFromProps(nextProps, nextState) {
    const { loan, resources: { loanActions, userIds, users, loanActionsWithUser } } = nextProps;

    if (!loanActions
      || !loanActions.records.length
      || loanActions.records[0].id !== loan.id) {
      return null;
    }

    if (!userIds.query || userIds.loan.id !== loan.id) {
      const query = loanActions.records.map(r => {
        return `id==${r.metadata.updatedByUserId}`;
      }).join(' or ');
      nextProps.mutator.userIds.replace({ query, loan });
    }

    if (!users.records.length) return null;

    if (!loanActionsWithUser.records || loanActionsWithUser.loan.id !== loan.id
      || nextState.loanActionCount !== loanActions.other.totalRecords) {
      return {
        loanActionCount: loanActions.other.totalRecords
      };
    }

    return null;
  }

  componentDidUpdate(prevProps, prevState) {
    const { loan, resources: { loanActions, users } } = this.props;

    if (this.state.loanActionCount && this.state.loanActionCount !== prevState.loanActionCount) {
      this.joinLoanActionsWithUser(loanActions.records, users.records, loan);
    }
  }

  getContributorslist(loan) {
    this.loan = loan;
    const contributors = _.get(this.loan, ['item', 'contributors']);
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

  joinLoanActionsWithUser(loanActions, users, loan) {
    const userMap = users.reduce((memo, user) => {
      return Object.assign(memo, { [user.id]: user });
    }, {});
    const records = loanActions.map(la => {
      return Object.assign({}, la, { user: userMap[la.metadata.updatedByUserId] });
    });
    this.props.mutator.loanActionsWithUser.replace({ loan, records });
  }

  openNonRenewedLoansModal(nonRenewedLoanItems) {
    this.setState({ nonRenewedLoanItems });
    this.showNonRenewedLoansModal();
  }

  renew() {
    const { loan, user } = this.props;
    const promise = this.props.renew(loan, user);
    const singleRenewalFailure = [];
    promise
      .then(() => this.showCallout())
      .catch(() => {
        singleRenewalFailure.push(loan);
      });
    return promise;
  }

  getFeeFine() {
    const accounts = _.get(this.props.resources, ['loanAccountsActions', 'records'], []);
    let remaining = 0;
    accounts.forEach(a => {
      remaining += parseFloat(a.remaining);
    });
    return (remaining === 0) ? '-' : remaining.toFixed(2);
  }

  feefinedetails = (e) => {
    const loan = this.loan || {};
    const accounts = _.get(this.props.resources, ['loanAccountsActions', 'records'], []);
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
  }

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
    return (contributorsLength >= 77) ?
      (
        <Popover>
          <div data-role="target" style={{ cursor: 'pointer' }}><KeyValue label={this.props.stripes.intl.formatMessage({ id: 'ui-users.loans.columns.contributors' })} value={listTodisplay} /></div>
          <div data-role="popover">
            {
              this.list.map(contributor => <p key={contributor}>{contributor}</p>)
            }
          </div>
        </Popover>
      ) :
        <KeyValue label={this.props.stripes.intl.formatMessage({ id: 'ui-users.loans.columns.contributors' })} value={listTodisplay} />;
  }

  showNonRenewedLoansModal() {
    this.setState({ nonRenewedLoansModalOpen: true });
  }

  showTitle(loan) {
    this.loan = loan;
    const title = `${_.get(this.loan, ['item', 'title'], '')}`;
    if (title) {
      const titleTodisplay = (title.length >= 77) ? `${title.substring(0, 77)}...` : title;
      return <KeyValue
        label={this.props.stripes.intl.formatMessage({ id: 'ui-users.loans.columns.title' })}
        value={(
          <Link to={`/inventory/view/${_.get(this.loan, ['item', 'instanceId'], '')}`}>
            {`${titleTodisplay} (${_.get(this.loan, ['item', 'materialType', 'name'])})`}
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
    const { onCancel, loan, patronGroup, user, resources: { loanActionsWithUser }, stripes: { intl } } = this.props;
    const { nonRenewedLoanItems } = this.state;
    const loanActionsFormatter = {
      action: la => intl.formatMessage({ id: loanActionMap[la.action] }),
      actionDate: la => this.formatDateTime(_.get(la, ['metadata', 'updatedDate'], '-')),
      dueDate: la => this.formatDateTime(la.dueDate),
      itemStatus: la => la.itemStatus,
      Source: la => <Link to={`/users/view/${la.user.id}`}>{getFullName(la.user)}</Link>,
    };

    const contributorsList = this.getContributorslist(loan);
    const contributorsListString = contributorsList.join(' ');
    const contributorsLength = contributorsListString.length;
    // Number of characters to trucate the string = 77
    const listTodisplay = (contributorsList === '-') ? '-' : (contributorsListString.length >= 77) ? `${contributorsListString.substring(0, 77)}...` : `${contributorsListString.substring(0, contributorsListString.length - 2)}`;
    const nonRenewedLabel = this.props.stripes.intl.formatMessage({ id: 'ui-users.loans.items.nonRenewed.label' });
    const failedRenewalsSubHeading = (
      <p>
        <FormattedMessage
          id="ui-users.loans.items.nonRenewed.subHeading"
          values={{
            strongCount: <strong>{nonRenewedLoanItems.length}</strong>,
            count: nonRenewedLoanItems.length,
            verb: <strong>{this.props.stripes.intl.formatMessage({ id: 'ui-users.loans.item.nonRenewed.callout.verb' })}</strong>,
          }}
        />
      </p>
    );

    return (
      <Paneset isRoot>
        <Pane id="pane-loandetails" defaultWidth="100%" dismissible onClose={onCancel} paneTitle={`${intl.formatMessage({ id: 'ui-users.loans.loanDetails' })} - ${getFullName(user)} (${_.upperFirst(patronGroup.group)})`}>
          <Row>
            <Col>
              <Button buttonStyle="primary" onClick={this.renew}>{this.props.stripes.intl.formatMessage({ id: 'ui-users.renew' })}</Button>
            </Col>
            <Col>
              <Button buttonStyle="primary" onClick={this.showChangeDueDateDialog}>{this.props.stripes.intl.formatMessage({ id: 'stripes-smart-components.cddd.changeDueDate' })}</Button>
            </Col>
          </Row>
          <Row>
            <Col xs={2}>
              <KeyValue label={intl.formatMessage({ id: 'ui-users.loans.details.borrower' })} value={`${getFullName(user)}`} />
            </Col>
            <Col xs={2}>
              <this.connectedProxy id={loan.proxyUserId} onClick={this.props.onClickUser} {...this.props} />
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
              <KeyValue label={intl.formatMessage({ id: 'ui-users.loans.columns.barcode' })} value={<Link to={`/inventory/view/${_.get(loan, ['item', 'instanceId'], '')}/${_.get(loan, ['item', 'holdingsRecordId'], '')}/${_.get(loan, ['itemId'], '')}`}>{_.get(loan, ['item', 'barcode'], '')}</Link>} />
            </Col>
            <Col xs={2}>
              <KeyValue label={intl.formatMessage({ id: 'ui-users.loans.details.callNumber' })} value={_.get(loan, ['item', 'callNumber'], '-')} />
            </Col>
            <Col xs={2}>
              <KeyValue label={intl.formatMessage({ id: 'ui-users.loans.details.location' })} value={_.get(loan, ['item', 'location', 'name'], '-')} />
            </Col>
          </Row>
          <Row>
            <Col xs={2}>
              <KeyValue label={intl.formatMessage({ id: 'ui-users.loans.columns.itemStatus' })} value={_.get(loan, ['item', 'status', 'name'], '-')} />
            </Col>
            <Col xs={2}>
              <KeyValue label={intl.formatMessage({ id: 'ui-users.loans.columns.dueDate' })} value={this.formatDateTime(loan.dueDate) || '-'} />
            </Col>
            <Col xs={2}>
              <KeyValue label={intl.formatMessage({ id: 'ui-users.loans.columns.returnDate' })} value={this.formatDateTime(loan.systemReturnDate) || '-'} />
            </Col>
            <Col xs={2}>
              <KeyValue label={intl.formatMessage({ id: 'ui-users.loans.details.renewalCount' })} value={_.get(loan, ['renewalCount'], '-')} />
            </Col>
            <Col xs={2}>
              <KeyValue label={intl.formatMessage({ id: 'ui-users.loans.details.claimedReturned' })} value="TODO" />
            </Col>
          </Row>
          <Row>
            <Col xs={2}>
              <KeyValue label={intl.formatMessage({ id: 'ui-users.loans.details.loanPolicy' })} value={<Link to={`/settings/circulation/loan-policies/${loan.loanPolicyId}`}>TODO</Link>} />
            </Col>
            <Col xs={2}>
              <KeyValue label={intl.formatMessage({ id: 'ui-users.loans.columns.loanDate' })} value={this.formatDateTime(loan.loanDate) || '-'} />
            </Col>
            <Col xs={2}>
              <KeyValue
                label={intl.formatMessage({ id: 'ui-users.loans.details.fine' })}
                value={
                  <button onClick={(e) => this.feefinedetails(e)} type="button">{`${this.getFeeFine()}`}</button>
              }
              />
            </Col>
            <Col xs={2}>
              <KeyValue label={intl.formatMessage({ id: 'ui-users.loans.details.requestQueue' })} value="TODO" />
            </Col>
            <Col xs={2}>
              <KeyValue label={intl.formatMessage({ id: 'ui-users.loans.details.lost' })} value="TODO" />
            </Col>
          </Row>
          <br />
          {loanActionsWithUser && loanActionsWithUser.records &&
            <MultiColumnList
              id="list-loanactions"
              formatter={loanActionsFormatter}
              visibleColumns={['actionDate', 'action', 'dueDate', 'itemStatus', 'Source']}
              columnMapping={{
                action: intl.formatMessage({ id: 'ui-users.loans.columns.action' }),
                actionDate: intl.formatMessage({ id: 'ui-users.loans.columns.actionDate' }),
                dueDate: intl.formatMessage({ id: 'ui-users.loans.columns.dueDate' }),
                itemStatus: intl.formatMessage({ id: 'ui-users.loans.columns.itemStatus' }),
                Source: intl.formatMessage({ id: 'ui-users.loans.columns.source' }),
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
          { this.renderChangeDueDateDialog() }
          <Callout ref={(ref) => { this.callout = ref; }} />
        </Pane>
      </Paneset>
    );
  }
}

export default withRenew(LoanActionsHistory);
