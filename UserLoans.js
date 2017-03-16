import _ from 'lodash';
// We have to remove node_modules/react to avoid having multiple copies loaded.
// eslint-disable-next-line import/no-unresolved
import React, { PropTypes } from 'react';

import { Row, Col } from 'react-bootstrap';
import Button from '@folio/stripes-components/lib/Button';
import Icon from '@folio/stripes-components/lib/Icon';
import TextField from '@folio/stripes-components/lib/TextField';
import MultiColumnList from '@folio/stripes-components/lib/MultiColumnList';

const propTypes = {
  loans: PropTypes.arrayOf(PropTypes.object),
};

function UserLoans(props) {
  const { loans } = props;

  const loansFormatter = {
    title: loan => `${_.get(loan, ['item', 'title'], '')}`,
    barcode: loan => `${_.get(loan, ['item', 'barcode'], '')}`,
    status: loan => `${_.get(loan, ['status', 'name'], '')}`,
    loanDate: loan => loan.loanDate.substr(0, 10),
  };

  if (!loans) return <div />;

  return (<div>
    <Row>
      <Col xs={3}>
        <h3 className="marginTopHalf">Current loans</h3>
      </Col>
      <Col xs={4} sm={3}>
        <TextField
          rounded
          endControl={<Button buttonStyle="fieldControl"><Icon icon="clearX" /></Button>}
          startControl={<Icon icon="search" />}
          placeholder="Search"
          fullWidth
        />
      </Col>
      <Col xs={5} sm={6}>
        <Button align="end" bottomMargin0 >View Full History</Button>
      </Col>
    </Row>
    <MultiColumnList
      fullWidth
      formatter={loansFormatter}
      visibleColumns={['title', 'barcode', 'loanDate', 'status']}
      contentData={loans}
    />
  </div>);
}

UserLoans.propTypes = propTypes;

export default UserLoans;
