import _ from 'lodash';
// We have to remove node_modules/react to avoid having multiple copies loaded.
// eslint-disable-next-line import/no-unresolved
import React, { Component, PropTypes } from 'react';
import Paneset from '@folio/stripes-components/lib/Paneset';
import Pane from '@folio/stripes-components/lib/Pane';
import PaneMenu from '@folio/stripes-components/lib/PaneMenu';
import MultiColumnList from '@folio/stripes-components/lib/MultiColumnList';

class LoansHistory extends Component {

  static propTypes = {
    data: PropTypes.shape({
      loansHistory: PropTypes.arrayOf(PropTypes.object),
      userid: PropTypes.object.required,
    }),
    mutator: PropTypes.shape({
      users: React.PropTypes.shape({
        PUT: React.PropTypes.func.isRequired,
      }),
      userid: PropTypes.shape({
        replace: PropTypes.func,
      }),
    }),
    userid: PropTypes.string.isRequired,
    onCancel: PropTypes.func.isRequired,
  };

  static manifest = Object.freeze({
    loansHistory: {
      type: 'okapi',
      records: 'loans',
      GET: {
        path: 'circulation/loans?query=(userId=${userid})',
      },
    },
    userid: {},
  });

  constructor(props) {
    super(props);
    props.mutator.userid.replace(props.userid);
  }

  componentWillReceiveProps(nextProps) {
    this.props.mutator.userid.replace(nextProps.userid);
  }

  render() {

    const { data: { loansHistory } } = this.props;

    if (!loansHistory) return <div />;

    const historyFirstMenu = <PaneMenu><button onClick={this.props.onCancel} title="close" aria-label="Close Loans History"><span style={{ fontSize: '30px', color: '#999', lineHeight: '18px' }} >&times;</span></button></PaneMenu>;

    const loansFormatter = {
      title: loan => `${_.get(loan, ['item', 'title'], '')}`,
      barcode: loan => `${_.get(loan, ['item', 'barcode'], '')}`,
      status: loan => `${_.get(loan, ['status', 'name'], '')}`,
      loanDate: loan => loan.loanDate.substr(0, 10),
      returnDate: loan => (loan.returnDate ? loan.returnDate.substr(0, 10) : ''),
    };

    return (
      <Paneset>
        <Pane defaultWidth="100%" firstMenu={historyFirstMenu} paneTitle={'Loans History'}>
          <MultiColumnList
            fullWidth
            formatter={loansFormatter}
            visibleColumns={['title', 'barcode', 'loanDate', 'returnDate', 'status']}
            contentData={loansHistory}
          />
        </Pane>
      </Paneset>);
  }
}

export default LoansHistory;
