import _ from 'lodash';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import Link from 'react-router-dom/Link';
import PropTypes from 'prop-types';
import Popover from '@folio/stripes-components/lib/Popover';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import Modal from '@folio/stripes-components/lib/Modal';
import KeyValue from '@folio/stripes-components/lib/KeyValue';
import MultiColumnList from '@folio/stripes-components/lib/MultiColumnList';
import Pane from '@folio/stripes-components/lib/Pane';
import Paneset from '@folio/stripes-components/lib/Paneset';
import Button from '@folio/stripes-components/lib/Button';
import Callout from '@folio/stripes-components/lib/Callout';
import SafeHTMLMessage from '@folio/react-intl-safe-html';
import { getFullName } from './util';
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
    renew: PropTypes.func,
  };

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
  });

  constructor(props) {
    super(props);
    this.connectedProxy = props.stripes.connect(LoanActionsHistoryProxy);
    this.renew = this.renew.bind(this);
    this.getContributorslist = this.getContributorslist.bind(this);
    this.showContributors = this.showContributors.bind(this);
    this.formatDateTime = this.props.stripes.formatDateTime;
    this.hideNonRenewedLoansModal = this.hideNonRenewedLoansModal.bind(this);
    this.showTitle = this.showTitle.bind(this);
    this.state = {
      loanActionCount: 0,
      nonRenewedLoanItems: [],
      nonRenewedLoansModalOpen: false
    };
  }

  // TODO: refactor after join is supported in stripes-connect
  componentWillReceiveProps(nextProps) {
    const { loan, resources: { loanActions, userIds, users, loanActionsWithUser } } = nextProps;

    if (!loanActions.records.length ||
      loanActions.records[0].id !== loan.id) return;
    if (!userIds.query || userIds.loan.id !== loan.id) {
      const query = loanActions.records.map(r => {
        return `id==${r.metadata.updatedByUserId}`;
      }).join(' or ');
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
    const userMap = users.reduce((memo, user) => {
      return Object.assign(memo, { [user.id]: user });
    }, {});
    const records = loanActions.map(la => {
      return Object.assign({}, la, { user: userMap[la.metadata.updatedByUserId] });
    });
    this.props.mutator.loanActionsWithUser.replace({ loan, records });
  }

  showNonRenewedLoansModal() {
    this.setState({ nonRenewedLoansModalOpen: true });
  }

  hideNonRenewedLoansModal() {
    this.setState({ nonRenewedLoansModalOpen: false });
  }

  openNonRenewedLoansModal(nonRenewedLoanItems) {
    this.setState({ nonRenewedLoanItems });
    this.showNonRenewedLoansModal();
  }

  renew() {
    const loanToRenew = this.props.loan;
    const promise = this.props.renew(loanToRenew);
    const singleRenewalFailure = [];
    promise
      .then(() => this.showCallout())
      .catch(() => {
        singleRenewalFailure.push(loanToRenew);
        this.openNonRenewedLoansModal(singleRenewalFailure);
      });
    return promise;
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

  showContributors(list, listTodisplay, contributorsLength) {
    this.list = list;
    return (contributorsLength >= 77) ?
      (
        <Popover>
          <div data-role="target" style={{ cursor: 'pointer' }}><KeyValue label="Contributors" value={listTodisplay} /></div>
          <div data-role="popover">
            {
              this.list.map(contributor => <p key={contributor}>{contributor}</p>)
            }
          </div>
        </Popover>
      ) :
        <KeyValue label={this.props.stripes.intl.formatMessage({ id: 'ui-users.loans.columns.contributors' })} value={listTodisplay} />;
  }

  showTitle(loan) {
    this.loan = loan;
    const title = `${_.get(this.loan, ['item', 'title'], '')}`;
    if (title) {
      const titleTodisplay = (title.length >= 77) ? `${title.substring(0, 77)}...` : title;
      return <KeyValue label={this.props.stripes.intl.formatMessage({ id: 'ui-users.loans.columns.title' })} value={<Link to={`/inventory/view/${_.get(this.loan, ['item', 'instanceId'], '')}`}>{titleTodisplay}({_.get(this.loan, ['item', 'materialType', 'name'])})</Link>} />;
    }
    return '-';
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

  render() {
    const { onCancel, loan, patronGroup, user, resources: { loanActionsWithUser }, stripes: { intl } } = this.props;
    const { nonRenewedLoanItems } = this.state;
    const loanActionsFormatter = {
      action: la => intl.formatMessage({ id: loanActionMap[la.action] }),
      actionDate: la => this.formatDateTime(la.loanDate),
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
        <Pane id="pane-loandetails" defaultWidth="100%" dismissible onClose={onCancel} paneTitle={`${intl.formatMessage({ id: 'ui-users.loans.loanDetails' })} - ${getFullName(user)} (${_.upperFirst(patronGroup.group)})`} >
          <Row>
            <Col>
              <Button buttonStyle="primary" onClick={this.renew}>{this.props.stripes.intl.formatMessage({ id: 'ui-users.renew' })}</Button>
            </Col>
          </Row>
          <Row>
            <Col xs={2}>
              <KeyValue label={intl.formatMessage({ id: 'ui-users.loans.details.borrower' })} value={`${getFullName(user)}`} />
            </Col>
            <Col xs={2} >
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
            <Col xs={2} >
              <KeyValue label={intl.formatMessage({ id: 'ui-users.loans.columns.barcode' })} value={<Link to={`/inventory/view/${_.get(loan, ['item', 'instanceId'], '')}/${_.get(loan, ['item', 'holdingsRecordId'], '')}/${_.get(loan, ['itemId'], '')}`}>{_.get(loan, ['item', 'barcode'], '')}</Link>} />
            </Col>
            <Col xs={2} >
              <KeyValue label={intl.formatMessage({ id: 'ui-users.loans.details.callNumber' })} value={_.get(loan, ['item', 'callNumber'], '-')} />
            </Col>
            <Col xs={2} >
              <KeyValue label={intl.formatMessage({ id: 'ui-users.loans.details.location' })} value={_.get(loan, ['item', 'location', 'name'], '-')} />
            </Col>
          </Row>
          <Row>
            <Col xs={2} >
              <KeyValue label={intl.formatMessage({ id: 'ui-users.loans.columns.itemStatus' })} value={_.get(loan, ['item', 'status', 'name'], '-')} />
            </Col>
            <Col xs={2} >
              <KeyValue label={intl.formatMessage({ id: 'ui-users.loans.columns.dueDate' })} value={this.formatDateTime(loan.dueDate) || '-'} />
            </Col>
            <Col xs={2} >
              <KeyValue label={intl.formatMessage({ id: 'ui-users.loans.columns.returnDate' })} value={this.formatDateTime(loan.systemReturnDate) || '-'} />
            </Col>
            <Col xs={2} >
              <KeyValue label={intl.formatMessage({ id: 'ui-users.loans.details.renewalCount' })} value={_.get(loan, ['renewalCount'], '-')} />
            </Col>
            <Col xs={2} >
              <KeyValue label={intl.formatMessage({ id: 'ui-users.loans.details.claimedReturned' })} value="TODO" />
            </Col>
          </Row>
          <Row>
            <Col xs={2} >
              <KeyValue label={intl.formatMessage({ id: 'ui-users.loans.details.loanPolicy' })} value="TODO" />
            </Col>
            <Col xs={2} >
              <KeyValue label={intl.formatMessage({ id: 'ui-users.loans.columns.loanDate' })} value={this.formatDateTime(loan.loanDate) || '-'} />
            </Col>
            <Col xs={2} >
              <KeyValue label={intl.formatMessage({ id: 'ui-users.loans.details.fine' })} value="TODO" />
            </Col>
            <Col xs={2} >
              <KeyValue label={intl.formatMessage({ id: 'ui-users.loans.details.requestQueue' })} value="TODO" />
            </Col>
            <Col xs={2} >
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
          <Callout ref={(ref) => { this.callout = ref; }} />
        </Pane>
      </Paneset>
    );
  }
}

export default withRenew(LoanActionsHistory);
