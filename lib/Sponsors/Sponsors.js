import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import MultiColumnList from '@folio/stripes-components/lib/MultiColumnList';
import Pluggable from '@folio/stripes-components/lib/Pluggable';

import { getFullName, getRowURL, getAnchoredRowFormatter } from '../../util';

export default class Sponsors extends React.Component {
  static propTypes = {
    user: PropTypes.object,
    history: PropTypes.object,
    sponsors: PropTypes.arrayOf(PropTypes.object),
    onAdd: PropTypes.func,
    editable: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    this.addSponsor = this.addSponsor.bind(this);
    this.onSelectRow = this.onSelectRow.bind(this);
  }

  onSelectRow(event, user) {
    this.props.history.push(getRowURL(user));
  }

  addSponsor(selectedUser) {

  }

  render() {
    const sponsors = this.props.sponsors;
    const disableRecordCreation = true;
    const sponsorFormatter = {
      Sponsor: sp => getFullName(sp),
    };

    return (
      <div>
        <Row>
          <Col xs={12}>
            <MultiColumnList
              id="list-sponsors"
              formatter={sponsorFormatter}
              rowFormatter={getAnchoredRowFormatter}
              visibleColumns={['Sponsor']}
              contentData={sponsors}
              isEmptyMessage="No sponsors found"
              onRowClick={this.onSelectRow}
            />
          </Col>
        </Row>
        { this.props.editable &&
        <Row className="marginTopHalf">
          <Col xs={12}>
            <Pluggable
              aria-haspopup="true"
              type="find-user"
              {...this.props}
              dataKey="sponsors"
              searchLabel="&#43; Add Sponsor"
              searchButtonStyle="primary"
              selectUser={this.addSponsor}
              visibleColumns={['Name', 'Patron Group', 'Username', 'Barcode']}
              disableRecordCreation={disableRecordCreation}
            />
          </Col>
        </Row>}
      </div>
    );
  }
}
