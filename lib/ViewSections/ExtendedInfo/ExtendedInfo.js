import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import KeyValue from '@folio/stripes-components/lib/KeyValue';
import { Accordion } from '@folio/stripes-components/lib/Accordion';

import { formatDate } from '../../../util';

const ExtendedInfo = ({ expanded, onToggle, accordionId, user, stripes: { intl } }) => (
  <Accordion
    open={expanded}
    id={accordionId}
    onToggle={onToggle}
    label={intl.formatMessage({ id: 'ui-users.extended.extendedInformation' })}
  >
    <Row>
      <Col xs={3}>
        <KeyValue label={intl.formatMessage({ id: 'ui-users.extended.dateEnrolled' })} value={formatDate(_.get(user, ['enrollmentDate'], ''))} />
      </Col>
      <Col xs={3}>
        <KeyValue label={intl.formatMessage({ id: 'ui-users.extended.externalSystemId' })} value={_.get(user, ['externalSystemId'], '')} />
      </Col>
      <Col xs={3}>
        <KeyValue label={intl.formatMessage({ id: 'ui-users.extended.birthDate' })} value={formatDate(_.get(user, ['personal', 'dateOfBirth'], ''))} />
      </Col>
      <Col xs={3}>
        <KeyValue label={intl.formatMessage({ id: 'ui-users.extended.folioNumber' })} value={_.get(user, ['id'], '')} />
      </Col>
    </Row>
    <br />
  </Accordion>
);


ExtendedInfo.propTypes = {
  stripes: PropTypes.shape({
    intl: PropTypes.object.isRequired,
  }).isRequired,
  expanded: PropTypes.bool,
  onToggle: PropTypes.func,
  accordionId: PropTypes.string.isRequired,
  user: PropTypes.object,
};

export default ExtendedInfo;
