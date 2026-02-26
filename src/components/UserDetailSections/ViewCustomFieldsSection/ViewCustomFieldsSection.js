import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';

import { useStripes } from '@folio/stripes/core';
import { ViewCustomFieldsRecord } from '@folio/stripes/smart-components';

import {
  CUSTOM_FIELDS_ENTITY_TYPE,
  CUSTOM_FIELDS_LABEL_SCOPE,
  MODULE_NAME,
} from '../../../constants';

const propTypes = {
  accordionId: PropTypes.string,
  customFields: PropTypes.object.isRequired,
  expanded: PropTypes.bool,
  sectionId: PropTypes.string,
  onToggle: PropTypes.func,
};

const ViewCustomFieldsSection = ({
  accordionId,
  customFields,
  expanded,
  sectionId,
  onToggle,
}) => {
  const intl = useIntl();
  const stripes = useStripes();

  if (!stripes.hasInterface('custom-fields')) {
    return null;
  }

  return (
    <ViewCustomFieldsRecord
      accordionId={accordionId}
      onToggle={onToggle}
      expanded={expanded}
      backendModuleName={MODULE_NAME}
      entityType={CUSTOM_FIELDS_ENTITY_TYPE}
      customFieldsValues={customFields}
      customFieldsLabel={intl.formatMessage({ id: 'ui-users.custom.customFields' })}
      scope={CUSTOM_FIELDS_LABEL_SCOPE}
      sectionId={sectionId}
    />
  );
};

ViewCustomFieldsSection.propTypes = propTypes;

export default ViewCustomFieldsSection;
