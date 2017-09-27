import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { DropdownButton, MenuItem, Row, Col } from 'react-bootstrap';
import dateFormat from 'dateformat';
import Icon from '@folio/stripes-components/lib/Icon';
import Paneset from '@folio/stripes-components/lib/Paneset';
import Pane from '@folio/stripes-components/lib/Pane';
import PaneMenu from '@folio/stripes-components/lib/PaneMenu';
import MultiColumnList from '@folio/stripes-components/lib/MultiColumnList';
import TabButton from '@folio/stripes-components/lib/TabButton';
import loanHistoryMap from './data/loanHistoryMap';
import { formatDate, formatDateTime } from './util';

class LoansHistory extends React.Component {

  static propTypes = {
    stripes: PropTypes.shape({
      locale: PropTypes.string.isRequired,
    }).isRequired,
    history: PropTypes.object.isRequired,
    resources: PropTypes.shape({
      loansHistory: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }),
    mutator: PropTypes.shape({
      loanId: PropTypes.shape({
        replace: PropTypes.func,
      }),
      loansHistory: PropTypes.shape({
        PUT: PropTypes.func.isRequired,
      }),
    }).isRequired,
    onCancel: PropTypes.func.isRequired,
    openLoans: PropTypes.bool,
    onClickViewLoanActionsHistory: PropTypes.func.isRequired,
    onClickViewOpenLoans: PropTypes.func.isRequired,
    onClickViewClosedLoans: PropTypes.func.isRequired,
  };

  static manifest = Object.freeze({
    loanId: {},
    loansHistory: {
      type: 'okapi',
      records: 'loans',
      path: 'circulation/loans?query=(userId=!{userid}) sortby id&limit=100',
      PUT: {
        path: 'circulation/loans/%{loanId}',
      },
    },
  });

  constructor(props) {
    super(props);

    this.handleOptionsChange = this.handleOptionsChange.bind(this);
    this.handleOptionsClick = this.handleOptionsClick.bind(this);
  }

  /**
   * change handler for the options-menu prevents the event from bubbling
   * up to the event handler attached to the row.
   */
  handleOptionsChange(key, e) {
    e.preventDefault();
    e.stopPropagation();

    if (key.action && this[key.action]) {
      this[key.action](key.loan);
    }
  }

  renew(loan) {
    const loanDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(loanDate.getDate() + 30);

    Object.assign(loan, {
      renewalCount: (loan.renewalCount || 0) + 1,
      loanDate: dateFormat(loanDate, "yyyy-mm-dd'T'HH:MM:ss'Z'"),
      dueDate: dateFormat(dueDate, "yyyy-mm-dd'T'HH:MM:ss'Z'"),
      action: 'renewed',
    });

    this.props.mutator.loanId.replace(loan.id);
    this.props.mutator.loansHistory.PUT(_.omit(loan, ['item', 'rowIndex']));
  }

  /**
   * click handler for the options-menu prevents the event from bubbling
   * up to the event handler attached to the row.
   */
   // eslint-disable-next-line class-methods-use-this
  handleOptionsClick(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  goToItem(e, itemId) {
    this.props.history.push(`/items/view/${itemId}`);
    e.preventDefault();
  }

  renderActions(loan) {
    return (
      <DropdownButton
        title="•••"
        id={`bg-nested-dropdown-${loan.id}`}
        noCaret
        pullRight onClick={this.handleOptionsClick}
        onSelect={this.handleOptionsChange}
      >
        <MenuItem eventKey={{ loan, action: 'renew' }}>Renew</MenuItem>
      </DropdownButton>
    );
  }

  render() {
    const loansHistory = _.get(this.props.resources, ['loansHistory', 'records']);
    const loanStatus = this.props.openLoans ? 'Open' : 'Closed';
    const loans = _.filter(loansHistory, loan => loanStatus === _.get(loan, ['status', 'name']));
    if (!loans) return <div />;

    const paneHeader = (
      <Row style={{ width: '100%' }}>
        <Col xs={1}><PaneMenu><button
          onClick={this.props.onCancel}
          title="Close pane"
          aria-label="Close Loans"
        >
          <Icon icon="closeX" /></button></PaneMenu>
        </Col>
        <Col xs={2}><PaneMenu><TabButton title="Loans" aria-label="Loans">Loans</TabButton></PaneMenu>
        </Col>
        <Col xs={9}>
          <PaneMenu>
            <TabButton title="Open Loans" aria-label="Open Loans" onClick={this.props.onClickViewOpenLoans} selected={this.props.openLoans}>Open Loans</TabButton>
            <TabButton title="Closed Loans" aria-label="Closed Loans" onClick={this.props.onClickViewClosedLoans} selected={!this.props.openLoans}>Closed Loans</TabButton>
          </PaneMenu>
        </Col>
      </Row>
    );

    const loanTitleFormatter = (loan, label) => (
      <a
        href={`/items/view/${loan.itemId}`}
        onClick={e => this.goToItem(e, loan.itemId)}
      >{label}</a>
    );

    const loansFormatter = {
      title: loan => loanTitleFormatter(loan, _.get(loan, ['item', 'title'], '')),
      barcode: loan => loanTitleFormatter(loan, _.get(loan, ['item', 'barcode'], '')),
      itemStatus: loan => `${_.get(loan, ['item', 'status', 'name'], '')}`,
      loanDate: loan => formatDate(loan.loanDate, this.props.stripes.locale),
      dueDate: loan => (loan.dueDate ? formatDateTime(loan.dueDate, this.props.stripes.locale) : ''),
      renewals: loan => loan.renewalCount || 0,
      returnDate: loan => (loan.returnDate ? formatDateTime(loan.returnDate, this.props.stripes.locale) : ''),
      ' ': (loan) => {
        const status = _.get(loan, ['status', 'name'], '');
        return (status === 'Closed') ? (<div />) : this.renderActions(loan);
      },
    };

    return (
      <Paneset isRoot>
        <Pane
          id="pane-loanshistory"
          defaultWidth="100%"
          dismissible
          onClose={this.props.onCancel}
          header={paneHeader}
        >
          <MultiColumnList
            id="list-loanshistory"
            fullWidth
            formatter={loansFormatter}
            visibleColumns={['title', 'itemStatus', 'barcode', 'loanDate', 'dueDate', 'returnDate', 'renewals', ' ']}
            columnMapping={loanHistoryMap}
            columnOverflow={{ ' ': true }}
            contentData={loans}
            onRowClick={this.props.onClickViewLoanActionsHistory}
            autosize
            virtualize
          />
        </Pane>
      </Paneset>);
  }
}

export default LoansHistory;
