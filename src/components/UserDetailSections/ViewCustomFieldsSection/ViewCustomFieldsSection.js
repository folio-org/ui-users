import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';

import { ViewCustomFieldsRecord } from '@folio/stripes/smart-components';

import {
  CUSTOM_FIELDS_ENTITY_TYPE,
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

  return (
    <ViewCustomFieldsRecord
      accordionId={accordionId}
      onToggle={onToggle}
      expanded={expanded}
      backendModuleName={MODULE_NAME}
      entityType={CUSTOM_FIELDS_ENTITY_TYPE}
      customFieldsValues={customFields}
      customFieldsLabel={intl.formatMessage({ id: 'ui-users.custom.customFields' })}
      sectionId={sectionId}
    />
  );
};

ViewCustomFieldsSection.propTypes = propTypes;

export default ViewCustomFieldsSection;
