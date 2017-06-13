import _ from 'lodash';
// We have to remove node_modules/react to avoid having multiple copies loaded.
// eslint-disable-next-line import/no-unresolved
import React, { Component, PropTypes } from 'react';
import { Row, Col } from 'react-bootstrap';
import KeyValue from '@folio/stripes-components/lib/KeyValue';
import MultiColumnList from '@folio/stripes-components/lib/MultiColumnList';
import Pane from '@folio/stripes-components/lib/Pane';
import PaneMenu from '@folio/stripes-components/lib/PaneMenu';
import Paneset from '@folio/stripes-components/lib/Paneset';
import { formatDate, getFullName } from './util';

class LoanActionsHistory extends Component {

  static propTypes = {
    stripes: PropTypes.shape({
      locale: PropTypes.string.isRequired,
    }).isRequired,
    loan: PropTypes.object,
    user: PropTypes.object,
    onCancel: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    // TODO: remove after back-end is ready
    this.state = {
      loanActions: [
        { id: 1, actionDate: '2017-06-12T22:56:25Z', action: 'Renew', dueDate: '2017-07-12T22:56:25Z',
          status: { name: 'Active' },
          desk: 'Main Desk', operator: 'Edward Ford', info: 'Lorem ipsum. Lorem ipsum.' },
        { id: 2, actionDate: '2017-06-12T22:56:25Z', action: 'Renew', dueDate: '2017-07-12T22:56:25Z',
          status: { name: 'Active' },
          desk: 'Reference Desk', operator: 'Gerald Estrada', info: 'Lorem ipsum.' }
      ]
    };
  }

  render() {
    const { loan, user, stripes: { locale } } = this.props;

    if (!loan) return <div />;

    const loanActions = this.state.loanActions;
    const historyFirstMenu = <PaneMenu><button onClick={this.props.onCancel} title="close" aria-label="Close Loan Actions History"><span style={{ fontSize: '30px', color: '#999', lineHeight: '18px' }} >&times;</span></button></PaneMenu>;
    const loanActionsFormatter = {
      Action: la => la.action,
      Operator: la => la.operator,
      Desk: la => la.desk,
      Status: la => `${_.get(la, ['status', 'name'], '')}`,
      'Action Date': la => formatDate(la.actionDate, locale),
      'Due Date': la => formatDate(la.dueDate, locale),
      'Additional Information': la => la.info,
    };

    return (
      <Paneset isRoot>
        <Pane defaultWidth="100%" firstMenu={historyFirstMenu} paneTitle={'Loan Actions History'}>
          <Row>
            <Col xs={5} >
              <Row>
                <Col xs={12}>
                  <KeyValue label="Title" value={_.get(loan, ['item', 'title'], '')} />
                </Col>
              </Row>
              <br />
              <Row>
                <Col xs={12}>
                  <KeyValue label="Description" value={_.get(loan, ['item', 'description'], '-')} />
                </Col>
              </Row>
            </Col>
            <Col xs={3} >
              <Row>
                <Col xs={12}>
                  <KeyValue label="Borrower" value={getFullName(user)} />
                </Col>
              </Row>
              <br />
              <Row>
                <Col xs={12}>
                  <KeyValue label="Loan Date" value={formatDate(loan.loanDate, locale) || '-'} />
                </Col>
              </Row>
               <br />
              <Row>
                <Col xs={12}>
                  <KeyValue label="Due Date" value={formatDate(loan.dueDate, locale) || '-'} />
                </Col>
              </Row>
              <Row>
                <Col xs={12}>
                  <KeyValue label="Loan Status" value={_.get(loan, ['status', 'name'], '-')} />
                </Col>
              </Row>
            </Col>
            <Col xs={4}>
              <Row>
                <Col xs={12}>
                  <KeyValue label="Process Id" value={loan.id} />
                </Col>
              </Row>
              <br />
              <Row>
                <Col xs={12}>
                  <KeyValue label="Return Date" value={formatDate(loan.returnDate, locale) || '-'} />
                </Col>
              </Row>
               <br />
              <Row>
                <Col xs={12}>
                  <KeyValue label="Booking Loan" value={_.get(loan, ['item', 'bookingLoan'], '-')}  />
                </Col>
              </Row>
            </Col>
          </Row>
          <br />
          <MultiColumnList
            formatter={loanActionsFormatter}
            visibleColumns={['Action Date', 'Action', 'Due Date', 'Status', 'Desk', 'Operator', 'Additional Information']}
            contentData={loanActions}
          />
        </Pane>
      </Paneset>);
  }
}

export default LoanActionsHistory;
