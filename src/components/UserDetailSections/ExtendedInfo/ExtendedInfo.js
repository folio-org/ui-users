import get from 'lodash/get';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import {
  Accordion,
  Col,
  FormattedUTCDate,
  Headline,
  KeyValue,
  Row,
} from '@folio/stripes/components';

import { requestPreferencesShape } from '../../../shapes';

import RequestPreferencesView from './components/RequestPreferencesView';
import ViewCustomFieldsSection from '../ViewCustomFieldsSection';
import { CUSTOM_FIELDS_SECTION } from '../../../constants';

const ExtendedInfo = (props) => {
  const {
    accordionId,
    expanded,
    onToggle,
    user,
    requestPreferences,
    defaultServicePointName,
    defaultDeliveryAddressTypeName,
    departments,
    userDepartments,
    customFields,
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
            {user.enrollmentDate ? <FormattedUTCDate value={user.enrollmentDate} /> : '-'}
          </KeyValue>
        </Col>
        <Col xs={12} md={3}>
          <KeyValue label={<FormattedMessage id="ui-users.extended.externalSystemId" />}>
            {user?.externalSystemId}
          </KeyValue>
        </Col>
        <Col xs={12} md={3}>
          <KeyValue label={<FormattedMessage id="ui-users.extended.birthDate" />}>
            {user.personal?.dateOfBirth ? <FormattedUTCDate value={user.personal.dateOfBirth} timeZone="UTC" /> : '-'}
          </KeyValue>
        </Col>
        <Col xs={12} md={3}>
          <KeyValue label={<FormattedMessage id="ui-users.extended.folioNumber" />}>
            {get(user, ['id'], '-')}
          </KeyValue>
        </Col>
      </Row>
      <RequestPreferencesView
        requestPreferences={requestPreferences}
        defaultServicePointName={defaultServicePointName}
        defaultDeliveryAddressTypeName={defaultDeliveryAddressTypeName}
      />
      <Row>
        {departments.length > 0 && (
          <Col xs={12} md={6}>
            <KeyValue
              label={<FormattedMessage id="ui-users.extended.department.name" />}
              data-testid="department-names"
            >
              {userDepartments.join(', ')}
            </KeyValue>
          </Col>
        )}
        <ViewCustomFieldsSection
          customFields={customFields}
          sectionId={CUSTOM_FIELDS_SECTION.EXTENDED_INFO}
        />
      </Row>
      <Row>
        <Col xs={12} md={6}>
          <KeyValue label={<FormattedMessage id="ui-users.information.username" />}>
            {get(user, ['username'], '')}
          </KeyValue>
        </Col>
      </Row>
    </Accordion>
  );
};

ExtendedInfo.propTypes = {
  accordionId: PropTypes.string.isRequired,
  customFields: PropTypes.arrayOf(PropTypes.object).isRequired,
  expanded: PropTypes.bool,
  onToggle: PropTypes.func,
  user: PropTypes.object,
  userDepartments: PropTypes.arrayOf(PropTypes.string).isRequired,
  defaultServicePointName: PropTypes.string,
  requestPreferences: requestPreferencesShape,
  defaultDeliveryAddressTypeName: PropTypes.string.isRequired,
  departments: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default ExtendedInfo;
