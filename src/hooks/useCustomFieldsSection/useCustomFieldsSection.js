import { useStripes } from '@folio/stripes/core';
import { Icon } from '@folio/stripes/components';
import { useCustomFieldsQuery } from '@folio/stripes/smart-components';

import {
  MODULE_NAME,
  CUSTOM_FIELDS_ENTITY_TYPE,
} from '../../constants';

/**
 * Custom hook to handle common custom fields logic for edit sections
 * @param {Object} params - Parameters object
 * @param {string} params.sectionId - The section ID for custom fields
 * @returns {React.ReactElement|null|undefined} Returns a loading spinner component when loading,
 *   null when no custom fields are available, or undefined when custom fields exist and component should continue rendering
 */
const useCustomFieldsSection = ({ sectionId }) => {
  const stripes = useStripes();

  const {
    customFields,
    isLoadingCustomFields,
  } = useCustomFieldsQuery({
    moduleName: MODULE_NAME,
    entityType: CUSTOM_FIELDS_ENTITY_TYPE,
    sectionId,
    isVisible: true,
  });

  if (!stripes.hasInterface('custom-fields')) {
    return null;
  }

  if (isLoadingCustomFields) {
    return <Icon icon="spinner-ellipsis" />;
  }

  if (!customFields?.length) {
    return null;
  }

  return undefined;
};

export default useCustomFieldsSection;
