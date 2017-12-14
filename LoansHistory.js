import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import Paneset from '@folio/stripes-components/lib/Paneset';
import Pane from '@folio/stripes-components/lib/Pane';
import PaneMenu from '@folio/stripes-components/lib/PaneMenu';
import TabButton from '@folio/stripes-components/lib/TabButton';
import IconButton from '@folio/stripes-components/lib/IconButton';

import { getFullName } from './util';
import OpenLoans from './lib/OpenLoans';
import ClosedLoans from './lib/ClosedLoans';

class LoansHistory extends React.Component {

  static propTypes = {
    stripes: PropTypes.shape({
      locale: PropTypes.string.isRequired,
      connect: PropTypes.func.isRequired,
    }).isRequired,
    resources: PropTypes.shape({
      loansHistory: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }),
    onCancel: PropTypes.func.isRequired,
    openLoans: PropTypes.bool,
    onClickViewOpenLoans: PropTypes.func.isRequired,
    onClickViewClosedLoans: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired,
    patronGroup: PropTypes.object.isRequired,
  };

  static manifest = Object.freeze({
    loansHistory: {
      type: 'okapi',
      records: 'loans',
      path: 'circulation/loans?query=(userId=!{user.id}) sortby id&limit=100',
    },
  });

  constructor(props) {
    super(props);
    this.connectedOpenLoans = props.stripes.connect(OpenLoans);
    this.connectedClosedLoans = props.stripes.connect(ClosedLoans);
  }

  render() {
    const { user, patronGroup, resources, openLoans } = this.props;
    const loansHistory = _.get(resources, ['loansHistory', 'records']);
    const loanStatus = openLoans ? 'Open' : 'Closed';
    const loans = _.filter(loansHistory, loan => loanStatus === _.get(loan, ['status', 'name']));
    if (!loans) return <div />;

    const paneHeader = (
      <Row style={{ width: '100%' }}>
        <Col xs={1}>
          <PaneMenu>
            <IconButton
              icon="closeX"
              onClick={this.props.onCancel}
              title="Close pane"
              ariaLabel="Close Loans"
            />
          </PaneMenu>
        </Col>
        <Col xs={1}>
          <PaneMenu>
            <TabButton title="Loans" aria-label="Loans">Loans</TabButton>
          </PaneMenu>
        </Col>
        <Col xs={3}>
          <TabButton title="Loans" aria-label="User Name and Patron Group">
            {`Borrower: ${getFullName(user)} (${_.upperFirst(patronGroup.group)})`}
          </TabButton>
        </Col>
        <Col xs={7}>
          <PaneMenu>
            <TabButton title="Open Loans" aria-label="Open Loans" onClick={this.props.onClickViewOpenLoans} selected={openLoans}>Open Loans</TabButton>
            <TabButton title="Closed Loans" aria-label="Closed Loans" onClick={this.props.onClickViewClosedLoans} selected={!openLoans}>Closed Loans</TabButton>
          </PaneMenu>
        </Col>
      </Row>
    );

    return (
      <Paneset isRoot>
        <Pane
          padContent={false}
          id="pane-loanshistory"
          defaultWidth="100%"
          dismissible
          onClose={this.props.onCancel}
          header={paneHeader}
        >
          {openLoans
            ? (<this.connectedOpenLoans loans={loans} {...this.props} />)
            : (<this.connectedClosedLoans loans={loans} {...this.props} />)
          }
        </Pane>
      </Paneset>);
  }
}

export default LoansHistory;
