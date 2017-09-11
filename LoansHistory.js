import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import DropdownMenu from '@folio/stripes-components/lib/DropdownMenu';
import { UncontrolledDropdown } from '@folio/stripes-components/lib/Dropdown';
import Button from '@folio/stripes-components/lib/Button';
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
  handleOptionsChange(loan, e) {
    e.preventDefault();
    e.stopPropagation();
    const action = e.target.dataset['action']
    if (action && this[action]) {
      this[action](loan);
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

  renderActions(loan) {
    const handleOptionsChange = _.partialRight(this.handleOptionsChange, loan, _);
    const tether = {
      attachment: 'bottom left',
      targetAttachment: 'top left',
      targetOffset: '0 100%',
      classPrefix: 'loans',
    };
    return (
      <UncontrolledDropdown
        tether={tether}
        id={`bg-nested-dropdown-${loan.id}`}
        pullRight onToggle={this.handleOptionsClick}
      >
        <Button hollow data-role="toggle" aria-haspopup="true" >&#46;&#46;&#46;</Button>
        <DropdownMenu
          data-role="menu"
          aria-label="available permissions"
          onSelect={e => handleOptionsChange(e)}
        >
          <Button fullWidth buttonStyle="transparent slim" style={{ textAlign: 'left' }} type="button" data-action="renew" >Renew</Button>
        </DropdownMenu>
      </UncontrolledDropdown>
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

    /*
     * loanTitleFormatter isn't currently in use, but apparently there's a use
     * case for having the cell content link to a different location than the
     * cell background. On a scale from 1 to WTF, I give this a 10, but I digress.
     * Note that both e.preventDefault() and e.stopPropagation() are required to
     * achieve this behavior.
     *
    const loanTitleFormatter = loan => (
      <a
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          this.props.doSomethingWithThisClick(e, loan);
        }}
      >{_.get(loan, ['item', 'title'], '')}</a>
    );

    const loansFormatter = {
      title: loanTitleFormatter,
      ...
    };
    */

    const loansFormatter = {
      title: loan => `${_.get(loan, ['item', 'title'], '')}`,
      barcode: loan => `${_.get(loan, ['item', 'barcode'], '')}`,
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
          />
        </Pane>
      </Paneset>);
  }
}

export default LoansHistory;
