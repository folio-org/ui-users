import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import {
  Row,
  Col,
  Accordion,
  KeyValue,
  Headline
} from '@folio/stripes/components';

import UserAddresses from '../../UserAddresses';
import contactTypes from '../../../data/contactTypes';

const ContactInfo = ({
  expanded,
  onToggle,
  accordionId,
  user,
  addressTypes,
  addresses,
}) => {
  const preferredContact = contactTypes.find(g => g.id === _.get(user, ['personal', 'preferredContactTypeId'], '')) || { type: '' };

  return (
    <Accordion
      open={expanded}
      id={accordionId}
      onToggle={onToggle}
      label={<Headline size="large" tag="h3"><FormattedMessage id="ui-users.contact.contactInformation" /></Headline>}
    >
      <Row>
        <Col xs={3}>
          <KeyValue
            label={<FormattedMessage id="ui-users.contact.email" />}
            value={_.get(user, ['personal', 'email'], '')}
          />
        </Col>
        <Col xs={3}>
          <KeyValue
            label={<FormattedMessage id="ui-users.contact.phone" />}
            value={_.get(user, ['personal', 'phone'], '')}
          />
        </Col>
        <Col xs={3}>
          <KeyValue
            label={<FormattedMessage id="ui-users.contact.mobilePhone" />}
            value={_.get(user, ['personal', 'mobilePhone'], '')}
          />
        </Col>
        <Col xs={3}>
          <KeyValue
            label={<FormattedMessage id="ui-users.contact.preferredContact" />}
            value={preferredContact.desc ? <FormattedMessage id={preferredContact.desc} /> : ''}
          />
        </Col>
      </Row>
      <br />
      <Row>
        <Col xs={12}>
          <UserAddresses
            addressTypes={addressTypes}
            addresses={addresses}
          />
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
