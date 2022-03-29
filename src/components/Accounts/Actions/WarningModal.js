import React from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
  injectIntl,
} from 'react-intl';

import {
  Button,
  Col,
  Modal,
  MultiColumnList,
  Row,
} from '@folio/stripes/components';

import {
  omit,
  orderBy,
  size,
} from 'lodash';

import {
  calculateSortParams,
  isRefundAllowed,
} from '../../util';

import css from './modal.css';

class WarningModal extends React.Component {
  static propTypes = {
    accounts: PropTypes.arrayOf(PropTypes.object),
    feeFineActions: PropTypes.arrayOf(PropTypes.object),
    onChangeAccounts: PropTypes.func.isRequired,
    open: PropTypes.bool,
    label: PropTypes.string,
    onClose: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      checkedAccounts: {},
      allChecked: true,
      sortOrder: ['Alert details', 'Fee/Fine type', 'Remaining', 'Payment Status', 'Item'],
      sortDirection: ['desc', 'asc']
    };
    this.sortMap = {
      'Alert details': this.getAlertDetailsFormatter,
      'Fee/Fine type': a => a.feeFineType,
      'Remaining': a => a.remaining,
      'Payment Status': a => (a.paymentStatus || {}).name,
      'Item': a => a.title,
    };
    this.onClickContinue = this.onClickContinue.bind(this);
  }

  componentDidUpdate(prevProps) {
    const accounts = this.props.accounts;
    const prevAccounts = prevProps.accounts;
    if (accounts !== prevAccounts) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        checkedAccounts: accounts.reduce((memo, a) => (Object.assign(memo, { [a.id]: a })), {}),
        allChecked: true,
      });
    }
  }

  toggleAll = (e) => {
    const accounts = this.props.accounts;

    const checkedAccounts = (e.target.checked)
      ? accounts.reduce((memo, a) => (Object.assign(memo, { [a.id]: a })), {})
      : {};

    this.setState(({ allChecked }) => ({
      allChecked: !allChecked,
      checkedAccounts
    }));
  }

  toggleItem = (e, a) => {
    e.stopPropagation();
    const id = a.id;
    const accounts = this.state.checkedAccounts;
    const checkedAccounts = (accounts[id])
      ? omit(accounts, id)
      : { ...accounts, [id]: a };
    const allChecked = size(checkedAccounts) === this.props.accounts.length;
    this.setState({ checkedAccounts, allChecked });
  }

  onSort = (e, meta) => {
    if (!this.sortMap[meta.alias]) return;

    const {
      sortOrder,
      sortDirection,
    } = this.state;

    this.setState(calculateSortParams({
      sortOrder,
      sortDirection,
      sortValue: meta.alias,
    }));
  };

  getAlertDetailsFormatter = (a) => {
    const {
      intl: { formatMessage },
      label,
      feeFineActions,
    } = this.props;

    const warningMessage = (
      <span className={css.alertDetails}>
        <FormattedMessage id="ui-users.accounts.actions.warning.deselect" />
      </span>
    );

    const showWarning = label === formatMessage({ id: 'ui-users.accounts.actions.refundFeeFine' })
      ? !isRefundAllowed(a, feeFineActions)
      : a?.status?.name === 'Closed';

    return showWarning ? warningMessage : '';
  };

  getAccountsFormatter() {
    const { checkedAccounts } = this.state;
    return {
      ' ': a => (
        <input
          checked={!!(checkedAccounts[a.id])}
          onClick={e => this.toggleItem(e, a)}
          type="checkbox"
        />
      ),
      'Alert details': this.getAlertDetailsFormatter,
      'Fee/Fine type': a => a.feeFineType || '',
      'Remaining': a => parseFloat(a.remaining).toFixed(2) || '0.00',
      'Payment Status': a => (a.paymentStatus || {}).name || '-',
      'Item': a => a.title || '',
    };
  }

  rowUpdater = (a) => {
    const { checkedAccounts } = this.state;
    return !!(checkedAccounts[a.id]);
  }

  onClickContinue() {
    const { checkedAccounts } = this.state;
    const values = Object.values(checkedAccounts);

    this.props.onChangeAccounts(values);
  }

  renderWarningMessage() {
    const {
      label,
      accounts = [],
      intl: {
        formatMessage,
      },
      feeFineActions,
    } = this.props;

    let action;
    let invalidItemsAmount = accounts.filter(a => a.status && a.status.name === 'Closed').length;
    let reason = <FormattedMessage id="ui-users.accounts.actions.warning.closedItems" />;
    const notAllowedToRefundItemsAmount = accounts.filter(a => !isRefundAllowed(a, feeFineActions)).length;
    const selectedItemsAmount = accounts.length;

    switch (label) {
      case formatMessage({ id: 'ui-users.accounts.actions.payFeeFine' }):
        action = <FormattedMessage id="ui-users.accounts.actions.warning.paymentAction" />;
        break;
      case formatMessage({ id: 'ui-users.accounts.actions.waiveFeeFine' }):
        action = <FormattedMessage id="ui-users.accounts.actions.warning.waiveAction" />;
        break;
      case formatMessage({ id: 'ui-users.accounts.actions.transferFeeFine' }):
        action = <FormattedMessage id="ui-users.accounts.actions.warning.transferAction" />;
        break;
      default:
        action = <FormattedMessage id="ui-users.accounts.actions.warning.refundAction" />;
        invalidItemsAmount = notAllowedToRefundItemsAmount;
        reason = <FormattedMessage id="ui-users.accounts.actions.warning.unpaidItems" />;
        break;
    }

    return (
      <FormattedMessage
        id="ui-users.accounts.actions.warning.summary"
        values={{
          selectedItemsAmount,
          invalidItemsAmount,
          action,
          reason,
        }}
      />
    );
  }

  render() {
    const {
      intl: { formatMessage },
      label,
      feeFineActions,
    } = this.props;

    const {
      sortOrder,
      sortDirection,
      allChecked,
      checkedAccounts,
    } = this.state;

    const accountOrdered = orderBy(this.props.accounts, [this.sortMap[sortOrder[0]], this.sortMap[sortOrder[1]]], sortDirection);
    const columnMapping = {
      ' ': <input id="warning-checkbox" type="checkbox" checked={allChecked} name="check-all" onChange={this.toggleAll} />,
      'Alert details': formatMessage({ id: 'ui-users.accounts.actions.warning.alertDetails' }),
      'Fee/Fine type': formatMessage({ id: 'ui-users.accounts.actions.warning.feeFineType' }),
      'Remaining': formatMessage({ id: 'ui-users.accounts.actions.warning.remaining' }),
      'Payment Status': formatMessage({ id: 'ui-users.accounts.actions.warning.paymentStatus' }),
      'Item': formatMessage({ id: 'ui-users.accounts.actions.warning.item' }),
    };

    const values = Object.values(checkedAccounts);

    const hasInvalidAccounts = values.some(a => {
      return label === formatMessage({ id: 'ui-users.accounts.actions.refundFeeFine' })
        ? !isRefundAllowed(a, feeFineActions)
        : a?.status?.name === 'Closed';
    });

    return (
      <Modal
        id="warning-modal"
        open={this.props.open}
        label={this.props.label}
        onClose={this.props.onClose}
        size="medium"
        dismissible
      >
        <Row>
          <Col xs>
            {this.renderWarningMessage()}
          </Col>
        </Row>
        <Row>
          <Col xs>
            <MultiColumnList
              id="warning-mcl"
              formatter={this.getAccountsFormatter()}
              columnMapping={columnMapping}
              columnWidths={{ ' ': 28, 'Alert details':160, 'Fee/Fine type':140, 'Remaining':80, 'Payment Status':140, 'Item':160 }}
              visibleColumns={[' ', 'Alert details', 'Fee/Fine type', 'Remaining', 'Payment Status', 'Item']}
              onHeaderClick={this.onSort}
              sortOrder={sortOrder[0]}
              sortDirection={`${sortDirection[0]}ending`}
              contentData={accountOrdered}
              rowUpdater={this.rowUpdater}
            />
          </Col>
        </Row>
        <Row
          end="xs"
          className={css.lastRow}
        >
          <Col xs>
            <Button
              id="warningTransferCancel"
              onClick={this.props.onClose}
            >
              <FormattedMessage id="ui-users.feefines.modal.cancel" />
            </Button>
            <Button
              id="warningTransferContinue"
              disabled={hasInvalidAccounts || values.length === 0}
              buttonStyle="primary"
              onClick={this.onClickContinue}
            >
              <FormattedMessage id="ui-users.feefines.modal.submit" />
            </Button>
          </Col>
        </Row>
      </Modal>
    );
  }
}

export default injectIntl(WarningModal);
