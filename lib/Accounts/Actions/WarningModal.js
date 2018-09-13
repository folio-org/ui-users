import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import Modal from '@folio/stripes-components/lib/Modal';
import MultiCloumnList from '@folio/stripes-components/lib/MultiColumnList';
import Button from '@folio/stripes-components/lib/Button';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';

class WarningModal extends React.Component {
  static propTypes = {
    accounts: PropTypes.arrayOf(PropTypes.object),
    onChangeAccounts: PropTypes.func.isRequired,
    open: PropTypes.bool,
    label: PropTypes.string,
    onClose: PropTypes.func.isRequired,
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
      'Alert details': a => ((a.status || {}).name === 'Closed' ? 'Deselect' : ''),
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
      ? _.omit(accounts, id)
      : { ...accounts, [id]: a };
    const allChecked = _.size(checkedAccounts) === this.props.accounts.length;
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
      'Alert details': a => (((a.status || {}).name === 'Closed') ? <span style={{ color: 'red' }}>Deselect to continue</span> : ''),
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

  render() {
    const { sortOrder, sortDirection, allChecked, checkedAccounts } = this.state;
    const columnMapping = {
      ' ': (<input type="checkbox" checked={allChecked} name="check-all" onChange={this.toggleAll} />),
    };
    const accounts = _.orderBy(this.props.accounts, [this.sortMap[sortOrder[0]], this.sortMap[sortOrder[1]]], sortDirection);
    const closed = accounts.filter(a => a.status.name === 'Closed') || [];
    const values = Object.values(checkedAccounts) || [];
    const checkedClosed = values.filter(a => a.status.name === 'Closed') || [];
    return (
      <Modal
        open={this.props.open}
        label={this.props.label}
        onClose={this.props.onClose}
        size="medium"
        dismissible
      >
        <Row>
          <Col xs>
            {`${accounts.length} items selected. ${closed.length} items cannot be ${this.props.label === 'Pay fees/fines' ? 'paid' : 'waived'} because they are alredy closed`}
          </Col>
        </Row>
        <Row>
          <Col xs>
            <MultiCloumnList
              formatter={this.getAccountsFormatter()}
              columnMapping={columnMapping}
              columnWidths={{ ' ': 28 }}
              visibleColumns={[' ', 'Alert details', 'Fee/Fine type', 'Remaining', 'Payment Status', 'Item']}
              onHeaderClick={this.onSort}
              sortOrder={sortOrder[0]}
              sortDirection={`${sortDirection[0]}ending`}
              contentData={this.props.accounts}
            />
          </Col>
        </Row>
        <Row>
          <Col xs>
            <Button onClick={this.props.onClose}>Cancel</Button>
            <Button disabled={checkedClosed.length > 0 || values.length === 0} buttonStyle="primary" onClick={this.onClickContinue}>Continue</Button>
          </Col>
        </Row>
      </Modal>
    );
  }
}

export default WarningModal;
