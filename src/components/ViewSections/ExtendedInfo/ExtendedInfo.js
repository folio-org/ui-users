import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import {
  Row,
  Col,
  Accordion,
  KeyValue
} from '@folio/stripes/components';

const ExtendedInfo = ({ expanded, onToggle, accordionId, user, stripes: { intl }, stripes }) => (
  <Accordion
    open={expanded}
    id={accordionId}
    onToggle={onToggle}
    label={intl.formatMessage({ id: 'ui-users.extended.extendedInformation' })}
  >
    <Row>
      <Col xs={3}>
        <KeyValue label={intl.formatMessage({ id: 'ui-users.extended.dateEnrolled' })} value={stripes.formatDate(_.get(user, ['enrollmentDate'], ''))} />
      </Col>
      <Col xs={3}>
        <KeyValue label={intl.formatMessage({ id: 'ui-users.extended.externalSystemId' })} value={_.get(user, ['externalSystemId'], '')} />
      </Col>
      <Col xs={3}>
        <KeyValue label={intl.formatMessage({ id: 'ui-users.extended.birthDate' })} value={stripes.formatAbsoluteDate(_.get(user, ['personal', 'dateOfBirth'], ''))} />
      </Col>
      <Col xs={3}>
        <KeyValue label={intl.formatMessage({ id: 'ui-users.extended.folioNumber' })} value={_.get(user, ['id'], '')} />
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
  stripes: PropTypes.object.isRequired,
};

export default ExtendedInfo;
