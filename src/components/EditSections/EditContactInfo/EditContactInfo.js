import {
  FormattedMessage,
  injectIntl,
} from 'react-intl';
import PropTypes from 'prop-types';
import { Field } from 'react-final-form';
import isEqual from 'lodash/isEqual';

import {
  Select,
  TextField,
  Row,
  Col,
  Accordion,
  Headline,
  MultiSelection,
} from '@folio/stripes/components';
import { AddressEditList } from '@folio/stripes/smart-components';

import EditCustomFieldsSection from '../EditCustomFieldsSection';
import { toAddressTypeOptions } from '../../data/converters/address_type';
import contactTypes from '../../data/static/contactTypes';
import { preferredEmailCommunicationOptions } from './constants';
import { CUSTOM_FIELDS_SECTION } from '../../../constants';

const EditContactInfo = ({
  expanded,
  onToggle,
  accordionId,
  addressTypes,
  preferredContactTypeId,
  intl,
  disabled,
  isCreateMode = false,
}) => {
  const contactTypeOptions = (contactTypes || []).map(g => {
    return (
      <FormattedMessage key={g.id} id={g.desc}>
        {(message) => <option value={g.id}>{message}</option>}
      </FormattedMessage>
    );
  });

  const selectedContactTypeId = contactTypeOptions.find(c => preferredContactTypeId === c.id)?.id;

  const addressFields = {
    addressType: {
      component: Select,
      props: {
        dataOptions: toAddressTypeOptions(addressTypes),
        fullWidth: true,
        autoFocus: true,
        placeholder: intl.formatMessage({ id: 'ui-users.contact.selectAddressType' }),
      },
    },
  };

  const prefEmailCommFilterOptions = (filterText, list) => {
    // escape special characters in filter text, so they won't be interpreted by RegExp
    const escapedFilterText = filterText?.replace(/[#-.]|[[-^]|[?|{}]/g, '\\$&');

    const filterRegExp = new RegExp(`^${escapedFilterText}`, 'i');
    const renderedItems = filterText ? list.filter(item => item.value?.search(filterRegExp) !== -1) : list;
    const exactMatch = filterText ? (renderedItems.filter(item => item.value === filterText).length === 1) : false;
    return { renderedItems, exactMatch };
  };

  return (
    <Accordion
      open={expanded}
      id={accordionId}
      onToggle={onToggle}
      label={<Headline size="large" tag="h3"><FormattedMessage id="ui-users.contact.contactInfo" /></Headline>}
    >
      <Row>
        <Col xs={12} md={3}>
          <Field
            label={<FormattedMessage id="ui-users.contact.email" />}
            name="personal.email"
            id="adduser_email"
            component={TextField}
            required
            fullWidth
            disabled={disabled}
          />
        </Col>
        <Col xs={12} md={3}>
          <Field
            label={<FormattedMessage id="ui-users.contact.phone" />}
            name="personal.phone"
            id="adduser_phone"
            component={TextField}
            fullWidth
            disabled={disabled}
          />
        </Col>
        <Col xs={12} md={3}>
          <Field
            label={<FormattedMessage id="ui-users.contact.mobilePhone" />}
            name="personal.mobilePhone"
            id="adduser_mobilePhone"
            component={TextField}
            fullWidth
            disabled={disabled}
          />
        </Col>
        <Col xs={12} md={3}>
          <Field
            label={<FormattedMessage id="ui-users.contact.preferredContact" />}
            name="personal.preferredContactTypeId"
            id="adduser_preferredcontact"
            component={Select}
            fullWidth
            aria-required="true"
            required
            disabled={disabled}
            defaultValue={selectedContactTypeId}
          >
            <FormattedMessage id="ui-users.contact.selectContactType">
              {(message) => <option value="">{message}</option>}
            </FormattedMessage>
            {contactTypeOptions}
          </Field>
        </Col>
      </Row>
      <Row>
        <Col xs={12} md={3}>
          <Field
            component={MultiSelection}
            label={<FormattedMessage id="ui-users.contact.preferredEmailCommunication" />}
            id="adduserPreferredEmailCommunication"
            name="preferredEmailCommunication"
            dataOptions={preferredEmailCommunicationOptions}
            fullWidth
            disabled={disabled}
            filter={prefEmailCommFilterOptions}
            itemToString={(option) => option?.value ?? ''}
            isEqual={isEqual}
          />
        </Col>
        <EditCustomFieldsSection
          sectionId={CUSTOM_FIELDS_SECTION.CONTACT_INFO}
          isCreateMode={isCreateMode}
        />
      </Row>
      <br />
      <AddressEditList
        name="personal.addresses"
        fieldComponents={addressFields}
        canDelete
        formType="final-form"
        disabled={disabled}
      />
    </Accordion>
  );
};

EditContactInfo.propTypes = {
  expanded: PropTypes.bool,
  onToggle: PropTypes.func,
  accordionId: PropTypes.string.isRequired,
  addressTypes: PropTypes.arrayOf(PropTypes.shape({})),
  preferredContactTypeId: PropTypes.string,
  intl: PropTypes.shape({}).isRequired,
  disabled: PropTypes.bool,
  isCreateMode: PropTypes.bool,
};

export default injectIntl(EditContactInfo);
