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

  render() {
    const { data: { loansHistory } } = this.props;
    const loanStatus = this.props.openLoans ? 'Open' : 'Closed';
    const loans = _.filter(loansHistory, loan => loanStatus === _.get(loan, ['status', 'name']));
    if (!loans) return <div />;

    const historyLastMenu = (<PaneMenu>
      <Button title="Open Loans" aria-label="Open Loans" onClick={this.props.onClickViewOpenLoans}>Open Loans</Button>
      <Button title="Closed Loans" aria-label="Closed Loans" onClick={this.props.onClickViewClosedLoans}>Closed Loans</Button>
    </PaneMenu>);

    const loanTitleFormatter = loan => (
      <a
        onClick={(e) => {
          e.preventDefault();
          this.props.onClickViewLoanActionsHistory(e, loan);
        }}
      >{_.get(loan, ['item', 'title'], '')}</a>
    );

    const loansFormatter = {
      title: loanTitleFormatter,
      barcode: loan => `${_.get(loan, ['item', 'barcode'], '')}`,
      status: loan => `${_.get(loan, ['status', 'name'], '')}`,
      loanDate: loan => new Date(Date.parse(loan.loanDate)).toLocaleDateString(this.props.stripes.locale),
      returnDate: loan => (loan.returnDate ? new Date(Date.parse(loan.loanDate)).toLocaleDateString(this.props.stripes.locale) : ''),
      ' ': (loan) => {
        const loanStatusName = _.get(loan, ['status', 'name'], '');
        return (loanStatusName === 'Closed') ? '' : <select><option value="">•••</option><option>Renew</option></select>;
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
          />
        </Pane>
      </Paneset>);
  }
}

export default LoansHistory;
