import React from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
  injectIntl,
  intlShape,
} from 'react-intl';

import {
  Row,
  Col,
  Button,
  Modal,
  MultiColumnList,
} from '@folio/stripes/components';

import {
  omit,
  size,
  orderBy,
} from 'lodash';

class WarningModal extends React.Component {
  static propTypes = {
    accounts: PropTypes.arrayOf(PropTypes.object),
    onChangeAccounts: PropTypes.func.isRequired,
    open: PropTypes.bool,
    label: PropTypes.string,
    onClose: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      checkedAccounts: {},
      allChecked: true,
      sortOrder: ['Alert details', 'Fee/Fine type', 'Remainig', 'Payment Status', 'Item'],
      sortDirection: ['desc', 'asc']
    };
    this.sortMap = {
      'Alert details': a => ((a.status || {}).name === 'Closed' ? <FormattedMessage id="ui-users.accounts.actions.warning.deselect" /> : ''),
      'Fee/Fine type': a => a.feeFineType,
      'Remainig': a => a.remaining,
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
    let { sortOrder, sortDirection } = this.state;

    if (sortOrder[0] !== meta.alias) {
      sortOrder = [meta.alias, sortOrder[1]];
      sortDirection = ['asc', sortDirection[1]];
    } else {
      const direction = (sortDirection[0] === 'desc') ? 'asc' : 'desc';
      sortDirection = [direction, sortDirection[1]];
    }
    this.setState({ sortOrder, sortDirection });
  }

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
      'Alert details': a => (((a.status || {}).name === 'Closed') ? <span style={{ color: 'red' }}><FormattedMessage id="ui-users.accounts.actions.warning.deselect" /></span> : ''),
      'Fee/Fine type': a => a.feeFineType || '',
      'Remaining': a => parseFloat(a.remaining).toFixed(2) || '0.00',
      'Payment Status': a => (a.paymentStatus || {}).name || '-',
      'Item': a => a.title || '',
    };
  }

  onClickContinue() {
    const { checkedAccounts } = this.state;
    const values = Object.values(checkedAccounts) || [];
    this.props.onChangeAccounts(values);
  }

  renderWarningMessage() {
    const {
      label,
      accounts = [],
      intl: {
        formatMessage,
      },
    } = this.props;

    const selectedItemsAmount = accounts.length;
    const closedItemsAmount = accounts.filter(a => a.status.name === 'Closed').length;
    const action = label === formatMessage({ id: 'ui-users.accounts.actions.payFeeFine' })
      ? <FormattedMessage id="ui-users.accounts.actions.warning.payAction" />
      : (label === formatMessage({ id: 'ui-users.accounts.actions.waiveFeeFine' }))
        ? <FormattedMessage id="ui-users.accounts.actions.warning.waiveAction" />
        : <FormattedMessage id="ui-users.accounts.actions.warning.transferAction" />;
    return (
      <FormattedMessage
        id="ui-users.accounts.actions.warning.summary"
        values={{
          selectedItemsAmount,
          closedItemsAmount,
          action,
        }}
      />
    );
  }

  render() {
    const { formatMessage } = this.props.intl;
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

    const values = Object.values(checkedAccounts) || [];
    const checkedClosed = values.filter(a => a.status.name === 'Closed') || [];
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
            />
          </Col>
        </Row>
        <Row end="xs">
          <Col xs>
            <Button id="warningTransferCancel" onClick={this.props.onClose}><FormattedMessage id="ui-users.feefines.modal.cancel" /></Button>
            <Button id="warningTransferContinue" disabled={checkedClosed.length > 0 || values.length === 0} buttonStyle="primary" onClick={this.onClickContinue}><FormattedMessage id="ui-users.feefines.modal.submit" /></Button>
          </Col>
        </Row>
      </Modal>
    );
  }
}

export default injectIntl(WarningModal);
