// We have to remove node_modules/react to avoid having multiple copies loaded.
// eslint-disable-next-line import/no-unresolved
import React from 'react';

import { Row, Col } from 'react-bootstrap';
import Button from '@folio/stripes-components/lib/Button';
import Icon from '@folio/stripes-components/lib/Icon';
import TextField from '@folio/stripes-components/lib/TextField';
import MultiColumnList from '@folio/stripes-components/lib/MultiColumnList';

class UserLoans extends React.Component {

  constructor(props) {
    super(props);
    this.loans = [{
      Title: 'A title',
      Barcode: '1234',
      'Loan date': 'a date',
      'Return date': 'a date',
      'Loan status': 'the status',
    }];
  }

  render() {
    return (<div>
      <Row>
        <Col xs={3}>
          <h3 className="marginTopHalf">Loans</h3>
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
      <MultiColumnList fullWidth contentData={this.loans} />
    </div>);
  }
}

export default UserLoans;
