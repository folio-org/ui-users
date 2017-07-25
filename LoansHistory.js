import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import Button from '@folio/stripes-components/lib/Button';
import Paneset from '@folio/stripes-components/lib/Paneset';
import Pane from '@folio/stripes-components/lib/Pane';
import PaneMenu from '@folio/stripes-components/lib/PaneMenu';
import MultiColumnList from '@folio/stripes-components/lib/MultiColumnList';

class LoansHistory extends React.Component {

  static propTypes = {
    stripes: PropTypes.shape({
      locale: PropTypes.string.isRequired,
    }).isRequired,
    data: PropTypes.shape({
      loansHistory: PropTypes.arrayOf(PropTypes.object),
    }),
    onCancel: PropTypes.func.isRequired,
    openLoans: PropTypes.bool,
    onClickViewLoanActionsHistory: PropTypes.func.isRequired,
    onClickViewOpenLoans: PropTypes.func.isRequired,
    onClickViewClosedLoans: PropTypes.func.isRequired,
  };

  static manifest = Object.freeze({
    loansHistory: {
      type: 'okapi',
      records: 'loans',
      GET: {
        path: 'circulation/loans?query=(userId=!{userid})',
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
   // eslint-disable-next-line class-methods-use-this
  handleOptionsChange(e) {
    e.preventDefault();
    e.stopPropagation();
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

  render() {
    const { data: { loansHistory } } = this.props;
    const loanStatus = this.props.openLoans ? 'Open' : 'Closed';
    const loans = _.filter(loansHistory, loan => loanStatus === _.get(loan, ['status', 'name']));
    if (!loans) return <div />;

    const historyLastMenu = (<PaneMenu>
      <Button title="Open Loans" aria-label="Open Loans" onClick={this.props.onClickViewOpenLoans}>Open Loans</Button>
      <Button title="Closed Loans" aria-label="Closed Loans" onClick={this.props.onClickViewClosedLoans}>Closed Loans</Button>
    </PaneMenu>);

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
      status: loan => `${_.get(loan, ['status', 'name'], '')}`,
      loanDate: loan => new Date(Date.parse(loan.loanDate)).toLocaleDateString(this.props.stripes.locale),
      returnDate: loan => (loan.returnDate ? new Date(Date.parse(loan.loanDate)).toLocaleDateString(this.props.stripes.locale) : ''),
      ' ': (loan) => {
        const loanStatusName = _.get(loan, ['status', 'name'], '');
        return (loanStatusName === 'Closed') ? '' : <select onChange={this.handleOptionsChange} onClick={this.handleOptionsClick}><option value="">•••</option><option>Renew</option></select>;
      },
    };

    return (
      <Paneset isRoot>
        <Pane id="pane-loanshistory" defaultWidth="100%" lastMenu={historyLastMenu} dismissible onClose={this.props.onCancel} paneTitle={'Loans'}>
          <MultiColumnList
            id="list-loanshistory"
            fullWidth
            formatter={loansFormatter}
            visibleColumns={['title', 'barcode', 'loanDate', 'returnDate', 'status', ' ']}
            contentData={loans}
            onRowClick={this.props.onClickViewLoanActionsHistory}
          />
        </Pane>
      </Paneset>);
  }
}

export default LoansHistory;
