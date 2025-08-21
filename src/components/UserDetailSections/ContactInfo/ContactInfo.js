import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import {
  Row,
  Col,
  Accordion,
  KeyValue,
  Headline,
  NoValue,
} from '@folio/stripes/components';

import UserAddresses from '../../UserAddresses';
import contactTypes from '../../data/static/contactTypes';
import { CUSTOM_FIELDS_SECTION } from '../../../constants';
import ViewCustomFieldsSection from '../ViewCustomFieldsSection';

const ContactInfo = ({
  expanded,
  onToggle,
  accordionId,
  user,
  addressTypes,
  addresses,
  customFields,
}) => {
  const preferredContact = contactTypes.find(g => g.id === _.get(user, ['personal', 'preferredContactTypeId'], '')) || { type: '' };
  const preferredEmailCommunication = _.get(user, ['preferredEmailCommunication'])?.join(', ') || <NoValue />;

  return (
    <Accordion
      open={expanded}
      id={accordionId}
      onToggle={onToggle}
      label={<Headline size="large" tag="h3"><FormattedMessage id="ui-users.contact.contactInfo" /></Headline>}
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
      <Row>
        <Col xs={6}>
          <KeyValue
            label={<FormattedMessage id="ui-users.contact.preferredEmailCommunication" />}
            value={preferredEmailCommunication}
          />
        </Col>
        <ViewCustomFieldsSection
          customFields={customFields}
          sectionId={CUSTOM_FIELDS_SECTION.CONTACT_INFO}
        />
      </Row>
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
  customFields: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  expanded: PropTypes.bool,
  onToggle: PropTypes.func,
  accordionId: PropTypes.string.isRequired,
  user: PropTypes.shape({}),
  addressTypes: PropTypes.arrayOf(PropTypes.shape({})),
  addresses: PropTypes.arrayOf(PropTypes.shape({})),
};

export default ContactInfo;
