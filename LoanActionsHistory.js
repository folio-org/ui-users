import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-bootstrap';
import KeyValue from '@folio/stripes-components/lib/KeyValue';
import MultiColumnList from '@folio/stripes-components/lib/MultiColumnList';
import Pane from '@folio/stripes-components/lib/Pane';
import PaneMenu from '@folio/stripes-components/lib/PaneMenu';
import Paneset from '@folio/stripes-components/lib/Paneset';
import { formatDate, getFullName } from './util';

const LoanActionsHistory = ({ onCancel, loan, user, stripes: { locale } }) => {
  if (!loan) return <div />;

  // TODO: remove after back-end is ready
  const loanActions = [{
    action: 'Loan',
    actionDate: loan.loanDate,
    dueDate: loan.dueDate,
    operator: '',
  }];

  const historyFirstMenu = <PaneMenu><button onClick={onCancel} title="close" aria-label="Close Loan Actions History"><span style={{ fontSize: '30px', color: '#999', lineHeight: '18px' }} >&times;</span></button></PaneMenu>;
  const loanActionsFormatter = {
    Action: la => la.action,
    'Action Date': la => formatDate(la.actionDate, locale),
    'Due Date': la => formatDate(la.dueDate, locale) || '-',
    Operator: la => la.operator || '-',
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
                <KeyValue label="Loan Status" value={_.get(loan, ['status', 'name'], '-')} />
              </Col>
            </Row>
          </Col>
          <Col xs={4}>
            <Row>
              <Col xs={12}>
                <KeyValue label="Due Date" value={formatDate(loan.dueDate, locale) || '-'} />
              </Col>
            </Row>
          </Col>
        </Row>
        <br />
        <MultiColumnList
          formatter={loanActionsFormatter}
          visibleColumns={['Action Date', 'Action', 'Due Date', 'Operator']}
          contentData={loanActions}
        />
      </Pane>
    </Paneset>);
};

LoanActionsHistory.propTypes = {
  stripes: PropTypes.shape({
    locale: PropTypes.string.isRequired,
  }).isRequired,
  loan: PropTypes.object,
  user: PropTypes.object,
  onCancel: PropTypes.func.isRequired,
};

export default LoanActionsHistory;
