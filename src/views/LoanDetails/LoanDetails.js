import React from 'react';
import {
  FormattedMessage,
  FormattedTime,
  injectIntl,
} from 'react-intl';
import { compose } from 'redux';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  get,
  upperFirst,
  isEmpty,
  noop,
} from 'lodash';

import { ChangeDueDateDialog } from '@folio/stripes/smart-components';
import {
  Paneset,
  Pane,
  Modal,
  Button,
  Popover,
  MultiColumnList,
  KeyValue,
  Row,
  Col,
  NoValue,
  LoadingView,
  Dropdown,
  DropdownMenu,
} from '@folio/stripes/components';
import { IfPermission, stripesConnect } from '@folio/stripes/core';
import { effectiveCallNumber } from '@folio/stripes/util';

import PatronBlockModalWithOverrideModal from '../../components/PatronBlock/PatronBlockModalWithOverrideModal';
import {
  getFullName,
  nav,
  getOpenRequestsPath,
  getRenewalPatronBlocksFromPatronBlocks,
  accountsMatchStatus,
  checkUserActive,
} from '../../components/util';
import { itemStatuses, loanActions, refundClaimReturned } from '../../constants';
import {
  withRenew,
  withDeclareLost,
  withClaimReturned,
  withMarkAsMissing,
} from '../../components/Wrappers';
import loanActionMap from '../../components/data/static/loanActionMap';
import LoanProxyDetails from './LoanProxyDetails';

import css from './LoanDetails.css';

class LoanDetails extends React.Component {
  static propTypes = {
    isLoading: PropTypes.bool,
    stripes: PropTypes.object.isRequired,
    resources: PropTypes.shape({
      loanActions: PropTypes.object,
      loanActionsWithUser: PropTypes.object,
    }).isRequired,
    mutator: PropTypes.shape({
      modified: PropTypes.shape({
        replace: PropTypes.func,
      }),
      loanActionsWithUser: PropTypes.shape({
        replace: PropTypes.func,
      }),
      userIds: PropTypes.shape({
        replace: PropTypes.func,
      }),
      renewals: PropTypes.shape({
        replace: PropTypes.func,
      }),
    }).isRequired,
    loan: PropTypes.object,
    loanIsMissing: PropTypes.bool,
    patronGroup: PropTypes.object,
    user: PropTypes.object,
    loanActionsWithUser: PropTypes.arrayOf(PropTypes.object),
    loanAccountActions: PropTypes.arrayOf(PropTypes.object),
    loanPolicies: PropTypes.object,
    requestCounts: PropTypes.object,
    renew: PropTypes.func,
    declareLost: PropTypes.func,
    markAsMissing: PropTypes.func,
    claimReturned: PropTypes.func,
    toggleButton: PropTypes.func,
    declarationInProgress: PropTypes.bool,
    patronBlocks: PropTypes.arrayOf(PropTypes.object),
    intl: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    showErrorCallout: PropTypes.func.isRequired,
  };

  static defaultProps = {
    toggleButton: noop,
    loanAccountActions: [],
  };

  constructor(props) {
    super(props);
    this.nav = null;
    this.connectedChangeDueDateDialog = props.stripes.connect(ChangeDueDateDialog);
    this.getContributorslist = this.getContributorslist.bind(this);
    this.showContributors = this.showContributors.bind(this);
    this.hideNonRenewedLoansModal = this.hideNonRenewedLoansModal.bind(this);
    this.showTitle = this.showTitle.bind(this);
    this.showChangeDueDateDialog = this.showChangeDueDateDialog.bind(this);
    this.hideChangeDueDateDialog = this.hideChangeDueDateDialog.bind(this);
    this.viewFeeFine = this.viewFeeFine.bind(this);

    this.state = {
      nonRenewedLoanItems: [],
      nonRenewedLoansModalOpen: false,
      changeDueDateDialogOpen: false,
      patronBlockedModal: false,
    };
  }

  componentDidUpdate(prevProps) {
    const prevItemStatus = prevProps.loan?.item?.status?.name;
    const thistItemStatus = this.props.loan?.item?.status?.name;
    if (prevItemStatus && prevItemStatus !== thistItemStatus) {
      this.props.toggleButton(false);
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
    this.setState({ changeDueDateDialogOpen: false });
  }

  hideNonRenewedLoansModal() {
    this.setState({ nonRenewedLoansModalOpen: false });
  }

  onRenew = async (additionalInfo = '') => {
    const {
      loan,
      user,
      renew,
      mutator: {
        renewals,
      },
    } = this.props;

    await renew([loan], user, additionalInfo);

    return renewals?.replace({ ts: new Date().getTime() });
  }

  renew = async () => {
    const {
      patronBlocks,
    } = this.props;
    const countRenew = getRenewalPatronBlocksFromPatronBlocks(patronBlocks);

    if (!isEmpty(countRenew)) {
      return this.setState({
        patronBlockedModal: true,
      });
    }

    return this.onRenew();
  }

  viewFeeFine() {
    const { stripes, loanAccountActions } = this.props;
    const total = loanAccountActions.reduce((acc, { amount }) => (acc + parseFloat(amount)), 0);
    const suspendedAction = loanAccountActions.filter(a => a?.paymentStatus?.name === refundClaimReturned.PAYMENT_STATUS) || [];
    const suspendedMessage = (suspendedAction.length > 0) ? <FormattedMessage id="ui-users.accounts.suspended" /> : '';

    if (total === 0) return '-';

    const value = parseFloat(total).toFixed(2);
    const valueDisplay = stripes.hasPerm('ui-users.feesfines.view')
      ?
        <button
          data-test-fee-fine-details-link
          className={css.feefineButton}
          onClick={(e) => this.feefinedetails(e)}
          type="button"
        >
          { value }
        </button>
      :
      value;

    return <>{ valueDisplay }<br />{ suspendedMessage }</>;
  }

  feefinedetails = (e) => {
    const {
      history,
      match: { params },
      loanAccountActions,
    } = this.props;

    if (loanAccountActions.length === 1) {
      nav.onClickViewAccountActionsHistory(e, { id: loanAccountActions[0].id }, history, params);
      return undefined;
    }

    const loan = this.loan || {};

    if (accountsMatchStatus(loanAccountActions, 'closed')) {
      nav.onClickViewClosedAccounts(e, loan, history, params);
    } else if (accountsMatchStatus(loanAccountActions, 'open')) {
      nav.onClickViewOpenAccounts(e, loan, history, params);
    } else {
      nav.onClickViewAllAccounts(e, loan, history, params);
    }

    return undefined;
  };

  onOpenPatronBlockedModal = () => {
    this.setState({ patronBlockedModal: true });
  };

  onClosePatronBlockedModal = () => {
    this.setState({ patronBlockedModal: false });
  };

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
          <div data-role="target" className={css.cursor}>
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

    return <KeyValue
      label={<FormattedMessage id="ui-users.loans.columns.title" />}
      value="-"
    />;
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

  handleClose = () => {
    const {
      loan,
      history,
      match: { params },
      location,
    } = this.props;

    // if this loan detail was accessed through a fee/fine, accountid will be present.
    if (params.accountid) {
      history.push(`/users/${params.id}/accounts/view/${params.accountid}`);
    }

    const loanStatus = loan?.status ? loan.status?.name?.toLowerCase() : 'open';

    history.push({
      pathname: `/users/${params.id}/loans/${loanStatus}`,
      state: location.state,
    });
  }

  getPageTitle = (loanDetails) => {
    const {
      user,
      patronGroup,
    } = this.props;

    return (user ?
      `${loanDetails} - ${getFullName(user)} (${upperFirst(patronGroup.group)})` :
      loanDetails);
  }

  render() {
    const {
      loan,
      patronGroup,
      patronBlocks,
      user,
      loanActionsWithUser,
      stripes,
      intl,
      loanPolicies,
      requestCounts,
      declareLost,
      markAsMissing,
      claimReturned,
      declarationInProgress,
      loanIsMissing,
      isLoading,
      showErrorCallout,
    } = this.props;

    const {
      patronBlockedModal,
    } = this.state;

    if (isLoading) {
      return (
        <LoadingView
          id="pane-loandetails"
          defaultWidth="100%"
          paneTitle={<FormattedMessage id="ui-users.loans.history" />}
        />
      );
    }

    if (loanIsMissing) {
      return (
        <Paneset isRoot>
          <Pane
            id="pane-loandetails-404"
            defaultWidth="100%"
            dismissible
            onClose={this.handleClose}
            paneTitle={(
              <FormattedMessage id="ui-users.loans.loanDetails">
                {this.getPageTitle}
              </FormattedMessage>
            )}
          >
            <FormattedMessage id="ui-users.loan404" />
          </Pane>
        </Paneset>
      );
    }

    const loanPolicyName = isEmpty(loanPolicies)
      ? '-'
      : loanPolicies[loan.loanPolicyId];

    if (!loanPolicyName) {
      return <div />;
    }

    const { nonRenewedLoanItems } = this.state;
    const noLoanActionUser = user === null ?
      <FormattedMessage id="ui-users.user.unknown" /> :
      <FormattedMessage id="ui-users.loans.action.source.system" />;
    const loanActionsFormatter = {
      action: la => <FormattedMessage id={loanActionMap[la.action] ?? loanActionMap.unknownAction} />,
      actionDate: la => <FormattedTime value={get(la, ['metadata', 'updatedDate'], '-')} day="numeric" month="numeric" year="numeric" />,
      dueDate: la => <FormattedTime value={la.dueDate} day="numeric" month="numeric" year="numeric" />,
      itemStatus: la => la.itemStatus,
      source: la => {
        return la.user ?
          <Link to={`/users/view/${la.user?.id}`}>{getFullName(la.user)}</Link> :
          noLoanActionUser;
      },
      comments: ({ actionComment }) => (actionComment || '-'),
    };

    const itemRequestCount = requestCounts[this.props.loan.itemId] || 0;
    const requestQueueValue = (itemRequestCount && stripes.hasPerm('ui-users.requests.all,ui-requests.view'))
      ? (<Link to={getOpenRequestsPath(loan.itemId)}>{itemRequestCount}</Link>)
      : itemRequestCount;
    const contributorsList = this.getContributorslist(loan);
    const contributorsListString = contributorsList.join(' ');
    const contributorsLength = contributorsListString.length;
    const loanStatus = get(loan, ['status', 'name'], '-');
    const overduePolicyName = get(loan, ['overdueFinePolicy', 'name'], '-');
    const lostItemPolicyName = get(loan, ['lostItemPolicy', 'name'], '-');
    const itemStatus = get(loan, ['item', 'status', 'name'], '-');
    const claimedReturnedDate = itemStatus === itemStatuses.CLAIMED_RETURNED && loan.claimedReturnedDate;
    const isClaimedReturnedItem = itemStatus === itemStatuses.CLAIMED_RETURNED;
    const isDeclaredLostItem = itemStatus === itemStatuses.DECLARED_LOST;
    const isAgedToLostItem = itemStatus === itemStatuses.AGED_TO_LOST;
    const isLostAndPaid = itemStatus === itemStatuses.LOST_AND_PAID;
    let lostDate;
    const declaredLostActions = loanActionsWithUser.filter(currentAction => get(currentAction, ['action'], '') === loanActions.DECLARED_LOST);
    const agedTolostLostActions = loanActionsWithUser.filter(currentAction => get(currentAction, ['action'], '') === loanActions.AGED_TO_LOST);
    const lostAndPaidActions = loanActionsWithUser.filter(currentAction => get(currentAction, ['action'], '') === loanActions.CLOSED_LOAN);
    if (isDeclaredLostItem && declaredLostActions.length) {
      lostDate = get(declaredLostActions[0], ['metadata', 'updatedDate']);
    } else if (isAgedToLostItem && agedTolostLostActions.length) {
      lostDate = get(agedTolostLostActions[0], ['metadata', 'updatedDate']);
    } else if (isLostAndPaid) {
      lostDate = get(lostAndPaidActions[0], ['declaredLostDate']);
    }

    const buttonDisabled = (loanStatus && loanStatus === 'Closed');
    // Number of characters to truncate the string = 77
    const listTodisplay = (contributorsList === '-') ? '-' : (contributorsListString.length >= 77) ? `${contributorsListString.substring(0, 77)}...` : `${contributorsListString.substring(0, contributorsListString.length - 2)}`;
    const nonRenewedLabel = <FormattedMessage id="ui-users.loans.items.nonRenewed.label" />;
    const failedRenewalsSubHeading = (
      <p>
        <FormattedMessage
          id="ui-users.loans.items.nonRenewed.subHeading"
          values={{
            strongCount: <strong>{nonRenewedLoanItems.length}</strong>,
            count: nonRenewedLoanItems.length,
            verb: <strong><FormattedMessage id="ui-users.loans.item.nonRenewed.callout.verb" /></strong>,
          }}
        />
      </p>
    );
    const patronBlocksForModal = getRenewalPatronBlocksFromPatronBlocks(patronBlocks);
    const isUserActive = user ? checkUserActive(user) : false;
    const borrower = user ? getFullName(user) : <FormattedMessage id="ui-users.user.unknown" />;

    return (
      <div data-test-loan-actions-history>
        <Paneset isRoot>
          <Pane
            id="pane-loandetails"
            defaultWidth="100%"
            dismissible
            onClose={this.handleClose}
            paneTitle={(
              <FormattedMessage id="ui-users.loans.loanDetails">
                {this.getPageTitle}
              </FormattedMessage>
          )}
          >
            <Row>
              <span>
                <IfPermission perm="ui-users.loans.renew">
                  <Button
                    data-test-renew-button
                    disabled={buttonDisabled || isClaimedReturnedItem || !isUserActive}
                    buttonStyle="primary"
                    onClick={this.renew}
                  >
                    <FormattedMessage id="ui-users.renew" />
                  </Button>
                </IfPermission>
                {isClaimedReturnedItem &&
                  <Dropdown
                    id="resolve-claim-menu"
                    label={<FormattedMessage id="ui-users.loans.resolveClaim" />}
                    buttonProps={{ buttonStyle: 'primary' }}
                  >
                    <DropdownMenu data-test-resolve-claim-dropdown data-role="menu">
                      <IfPermission perm="ui-users.loans.declare-item-lost">
                        <Button
                          buttonStyle="dropdownItem"
                          data-test-declare-lost-button
                          disabled={buttonDisabled || isDeclaredLostItem}
                          onClick={() => declareLost(loan, itemRequestCount)}
                        >
                          <FormattedMessage id="ui-users.loans.declareLost" />
                        </Button>
                      </IfPermission>
                      <IfPermission perm="ui-users.loans.declare-claimed-returned-item-as-missing">
                        <Button
                          buttonStyle="dropdownItem"
                          data-test-dropdown-content-mark-as-missing-button
                          onClick={() => markAsMissing(loan, itemRequestCount)}
                        >
                          <FormattedMessage id="ui-users.loans.markAsMissing" />
                        </Button>
                      </IfPermission>
                    </DropdownMenu>
                  </Dropdown>
                }
                {!isClaimedReturnedItem &&
                  <IfPermission perm="ui-users.loans.claim-item-returned">
                    <Button
                      data-test-claim-returned-button
                      disabled={buttonDisabled}
                      buttonStyle="primary"
                      onClick={() => claimReturned(loan, itemRequestCount)}
                    >
                      <FormattedMessage id="ui-users.loans.claimReturned" />
                    </Button>
                  </IfPermission>
                }
                <IfPermission perm="ui-users.loans.change-due-date">
                  <Button
                    data-test-change-due-date-button
                    disabled={
                      buttonDisabled ||
                      isDeclaredLostItem ||
                      isClaimedReturnedItem ||
                      isAgedToLostItem
                    }
                    buttonStyle="primary"
                    onClick={this.showChangeDueDateDialog}
                  >
                    <FormattedMessage id="stripes-smart-components.cddd.changeDueDate" />
                  </Button>
                </IfPermission>
                <IfPermission perm="ui-users.loans.declare-item-lost">
                  <Button
                    data-test-declare-lost-button
                    disabled={declarationInProgress || buttonDisabled || isDeclaredLostItem}
                    buttonStyle="primary"
                    onClick={() => declareLost(loan, itemRequestCount)}
                  >
                    <FormattedMessage id="ui-users.loans.declareLost" />
                  </Button>
                </IfPermission>
              </span>
            </Row>
            <Row>
              <Col xs={2}>
                <KeyValue
                  label={<FormattedMessage id="ui-users.loans.details.borrower" />}
                  value={borrower}
                />
              </Col>
              <Col xs={2}>
                <LoanProxyDetails
                  id={loan.proxyUserId}
                  showErrorCallout={showErrorCallout}
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
                  data-test-effective-call-number
                  label={<FormattedMessage id="ui-users.loans.details.effectiveCallNumber" />}
                  value={effectiveCallNumber(loan)}
                />
              </Col>
              <Col xs={2}>
                <KeyValue
                  label={<FormattedMessage id="ui-users.loans.details.location" />}
                  value={get(loan, ['item', 'location', 'name'], '-')}
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
              <Col
                data-test-loan-actions-history-item-status
                xs={2}
              >
                <KeyValue
                  label={<FormattedMessage id="ui-users.loans.columns.itemStatus" />}
                  value={itemStatus}
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
              <Col
                data-test-loan-claimed-returned
                xs={2}
              >
                <KeyValue
                  label={<FormattedMessage id="ui-users.loans.details.claimedReturned" />}
                  value={claimedReturnedDate ?
                    (<FormattedTime value={claimedReturnedDate} day="numeric" month="numeric" year="numeric" />) :
                    (<NoValue />)
                  }
                />
              </Col>
              <Col xs={2}>
                <KeyValue
                  data-test-overdue-policy
                  label={<FormattedMessage id="ui-users.loans.details.overduePolicy" />}
                  value={<Link to={`/settings/circulation/fine-policies/${loan.overdueFinePolicyId}`}>{overduePolicyName}</Link>}
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
                  data-test-loan-fees-fines
                  label={<FormattedMessage id="ui-users.loans.details.fineIncurred" />}
                  value={this.viewFeeFine()}
                />
              </Col>
              <Col
                data-test-loan-actions-history-requests
                xs={2}
              >
                <KeyValue
                  label={<FormattedMessage id="ui-users.loans.details.requestQueue" />}
                  value={requestQueueValue}
                />
              </Col>
              <Col
                data-test-loan-actions-history-lost
                xs={2}
              >
                <KeyValue
                  label={<FormattedMessage id="ui-users.loans.details.lost" />}
                  value={lostDate ? (<FormattedTime value={lostDate} day="numeric" month="numeric" year="numeric" />) : (<NoValue />)}
                />
              </Col>
              <Col xs={2}>
                <KeyValue
                  data-test-lost-item-policy
                  label={<FormattedMessage id="ui-users.loans.details.lostItemPolicy" />}
                  value={<Link to={`/settings/circulation/lost-item-fee-policy/${loan.lostItemPolicyId}`}>{lostItemPolicyName}</Link>}
                />
              </Col>
            </Row>
            <br />
            {loanActionsWithUser &&
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
              contentData={loanActionsWithUser}
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
            <PatronBlockModalWithOverrideModal
              patronBlockedModalOpen={patronBlockedModal}
              onClosePatronBlockedModal={this.onClosePatronBlockedModal}
              onOpenPatronBlockedModal={this.onOpenPatronBlockedModal}
              onRenew={this.onRenew}
              patronBlocks={patronBlocksForModal}
              viewUserPath={`/users/view/${(user || {}).id}?filters=pg.${patronGroup.group}&sort=name`}
            />
            { this.props.user && this.renderChangeDueDateDialog() }
          </Pane>
        </Paneset>
      </div>
    );
  }
}

export default compose(
  injectIntl,
  withRenew,
  withDeclareLost,
  stripesConnect,
  withClaimReturned,
  withMarkAsMissing,
)(LoanDetails);
