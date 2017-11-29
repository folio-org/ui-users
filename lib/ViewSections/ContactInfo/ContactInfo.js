import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import { Accordion } from '@folio/stripes-components/lib/Accordion';
import KeyValue from '@folio/stripes-components/lib/KeyValue';

import UserAddresses from '../..//UserAddresses';
import contactTypes from '../../../data/contactTypes';

const ContactInfo = ({ expanded, onToggle, accordionId, user, addressTypes, addresses }) => {
  const preferredContact = contactTypes.find(g => g.id === _.get(user, ['personal', 'preferredContactTypeId'], '')) || { type: '' };

  return (
    <Accordion
      open={expanded}
      id={accordionId}
      onToggle={onToggle}
      label={
        <h2>Contact information</h2>
      }
    >
      <Row>
        <Col xs={3}>
          <KeyValue label="Email" value={_.get(user, ['personal', 'email'], '')} />
        </Col>
        <Col xs={3}>
          <KeyValue label="Phone" value={_.get(user, ['personal', 'phone'], '')} />
        </Col>
        <Col xs={3}>
          <KeyValue label="Mobile phone" value={_.get(user, ['personal', 'mobilePhone'], '')} />
        </Col>
        <Col xs={3}>
          <KeyValue label="Preferred contact" value={preferredContact.desc} />
        </Col>
      </Row>
      <br />
      <Row>
        <Col xs={12}>
          <UserAddresses addressTypes={addressTypes} addresses={addresses} />
        </Col>
      </Row>
      <br />
    </Accordion>
  );
};

ContactInfo.propTypes = {
  expanded: PropTypes.bool,
  onToggle: PropTypes.func,
  accordionId: PropTypes.string.isRequired,
  user: PropTypes.object,
  addressTypes: PropTypes.arrayOf(PropTypes.object),
  addresses: PropTypes.arrayOf(PropTypes.object),
};

export default ContactInfo;
