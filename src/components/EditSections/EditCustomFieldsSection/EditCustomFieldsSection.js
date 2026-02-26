import { Field, useForm } from 'react-final-form';
import PropTypes from 'prop-types';

import { useStripes } from '@folio/stripes/core';
import { EditCustomFieldsRecord } from '@folio/stripes/smart-components';

import {
  CUSTOM_FIELDS_ENTITY_TYPE,
  CUSTOM_FIELDS_LABEL_SCOPE,
  MODULE_NAME,
} from '../../../constants';

const propTypes = {
  accordionId: PropTypes.string,
  isCreateMode: PropTypes.bool,
  sectionId: PropTypes.string,
};

const EditCustomFieldsSection = ({
  accordionId,
  isCreateMode = false,
  sectionId,
}) => {
  const stripes = useStripes();
  const form = useForm();

  if (!stripes.hasInterface('custom-fields')) {
    return null;
  }

  return (
    <EditCustomFieldsRecord
      accordionId={accordionId}
      backendModuleName={MODULE_NAME}
      entityType={CUSTOM_FIELDS_ENTITY_TYPE}
      finalFormCustomFieldsValues={form.getState().values.customFields}
      fieldComponent={Field}
      changeFinalFormField={form.change}
      finalFormInstance={form}
      isCreateMode={isCreateMode}
      scope={CUSTOM_FIELDS_LABEL_SCOPE}
      sectionId={sectionId}
    />
  );
};

EditCustomFieldsSection.propTypes = propTypes;

export default EditCustomFieldsSection;
