import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import KeyValue from '@folio/stripes-components/lib/KeyValue';
import { Accordion } from '@folio/stripes-components/lib/Accordion';

const ExtendedInfo = ({ expanded, onToggle, accordionId, user, stripes }) => (
  <Accordion
    open={expanded}
    id={accordionId}
    onToggle={onToggle}
    label="Extended information"
  >
    <Row>
      <Col xs={3}>
        <KeyValue label="Date enrolled" value={stripes.formatDate(_.get(user, ['enrollmentDate'], ''))} />
      </Col>
      <Col xs={3}>
        <KeyValue label="External system ID" value={_.get(user, ['externalSystemId'], '')} />
      </Col>
      <Col xs={3}>
        <KeyValue label="Birth date" value={stripes.formatDate(_.get(user, ['personal', 'dateOfBirth'], ''))} />
      </Col>
      <Col xs={3}>
        <KeyValue label="FOLIO number" value={_.get(user, ['id'], '')} />
      </Col>
    </Row>
    <br />
  </Accordion>
);


ExtendedInfo.propTypes = {
  expanded: PropTypes.bool,
  onToggle: PropTypes.func,
  accordionId: PropTypes.string.isRequired,
  user: PropTypes.object,
  stripes: PropTypes.object,

};

export default ExtendedInfo;
