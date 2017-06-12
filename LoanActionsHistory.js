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

  render() {
    const { loan, user, stripes: { locale } } = this.props;

    if (!loan) return <div />;

    const historyFirstMenu = <PaneMenu><button onClick={this.props.onCancel} title="close" aria-label="Close Loan Actions History"><span style={{ fontSize: '30px', color: '#999', lineHeight: '18px' }} >&times;</span></button></PaneMenu>;

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
                  <KeyValue label="Process Id" value={item.id} />
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

          <MultiColumnList
            visibleColumns={['title', 'barcode', 'loanDate', 'returnDate', 'status']}
          />
        </Pane>
      </Paneset>);
  }
}

export default LoanActionsHistory;
