import { useCustomFieldsQuery } from '@folio/stripes/smart-components';

import {
  MODULE_NAME,
  CUSTOM_FIELDS_ENTITY_TYPE,
} from '../../constants';

const withCustomFields = (WrappedComponent, { isVisible, sectionId } = {}) => (props) => {
  const {
    customFields,
    isCustomFieldsError: customFieldsFetchFailed,
    isLoadingCustomFields,
  } = useCustomFieldsQuery({
    moduleName: MODULE_NAME,
    entityType: CUSTOM_FIELDS_ENTITY_TYPE,
    sectionId,
    isVisible,
  });

  const showCustomFieldsSection = isLoadingCustomFields || (!customFieldsFetchFailed && customFields?.length > 0);

  return (
    <WrappedComponent
      {...props}
      showCustomFieldsSection={showCustomFieldsSection}
      customFieldRecords={customFields}
      isLoadingCustomFields={isLoadingCustomFields}
      isCustomFieldsError={customFieldsFetchFailed}
    />
  );
};

export default withCustomFields;
