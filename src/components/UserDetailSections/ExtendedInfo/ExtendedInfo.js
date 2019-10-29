import get from 'lodash/get';
import React from 'react';
import PropTypes from 'prop-types';
import {
  FormattedDate,
  FormattedMessage,
} from 'react-intl';
import {
  Accordion,
  Col,
  Headline,
  KeyValue,
  Row
} from '@folio/stripes/components';

import { requestPreferencesShape } from '../../../shapes';

import RequestPreferencesView from './components/RequestPreferencesView';

const ExtendedInfo = (props) => {
  const {
    accordionId,
    expanded,
    onToggle,
    user,
    requestPreferences,
    defaultServicePointName,
    defaultDeliveryAddressTypeName,
  } = props;

  return (
    <Accordion
      id={accordionId}
      label={<Headline size="large" tag="h3"><FormattedMessage id="ui-users.extended.extendedInformation" /></Headline>}
      onToggle={onToggle}
      open={expanded}
    >
      <Row>
        <Col xs={12} md={3}>
          <KeyValue label={<FormattedMessage id="ui-users.extended.dateEnrolled" />}>
            {user.enrollmentDate ? <FormattedDate value={user.enrollmentDate} /> : '-'}
          </KeyValue>
        </Col>
        <Col xs={12} md={3}>
          <KeyValue label={<FormattedMessage id="ui-users.extended.birthDate" />}>
            {user.personal.dateOfBirth ? <FormattedDate value={user.personal.dateOfBirth} timeZone="UTC" /> : '-'}
          </KeyValue>
        </Col>
      </Row>
      <Row>
        <Col xs={12} md={6}>
          <KeyValue label={<FormattedMessage id="ui-users.extended.folioNumber" />}>
            {get(user, ['id'], '-')}
          </KeyValue>
        </Col>
        <Col xs={12} md={6}>
          <KeyValue label={<FormattedMessage id="ui-users.extended.externalSystemId" />}>
            {get(user, ['externalSystemId'], '-')}
          </KeyValue>
        </Col>
      </Row>
      <Row>
        <Col xs={3}>
          <KeyValue label={<FormattedMessage id="ui-users.information.username" />}>
            {get(user, ['username'], '')}
          </KeyValue>
        </Col>
        <Col xs={9}>
          <RequestPreferencesView
            requestPreferences={requestPreferences}
            defaultServicePointName={defaultServicePointName}
            defaultDeliveryAddressTypeName={defaultDeliveryAddressTypeName}
          />
        </Col>
      </Row>
    </Accordion>
  );
};

ExtendedInfo.propTypes = {
  accordionId: PropTypes.string.isRequired,
  expanded: PropTypes.bool,
  onToggle: PropTypes.func,
  user: PropTypes.object,
  defaultServicePointName: PropTypes.string,
  requestPreferences: requestPreferencesShape,
  defaultDeliveryAddressTypeName: PropTypes.string.isRequired,
};

export default ExtendedInfo;
