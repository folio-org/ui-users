import { Field, useForm } from 'react-final-form';
import PropTypes from 'prop-types';

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
  const form = useForm();

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
