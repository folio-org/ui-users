import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';

import {
  Accordion,
  Row,
  Headline,
} from '@folio/stripes/components';

import EditCustomFieldsSection from '../EditCustomFieldsSection';
import { useCustomFieldsSection } from '../../../hooks';
import {
  CUSTOM_FIELDS_SECTION,
} from '../../../constants';

const propTypes = {
  accordionId: PropTypes.string.isRequired,
  isCreateMode: PropTypes.bool.isRequired,
};

const EditFeesFines = ({
  accordionId,
  isCreateMode,
}) => {
  const intl = useIntl();
  const renderState = useCustomFieldsSection({ sectionId: CUSTOM_FIELDS_SECTION.FEES_FINES });

  if (renderState !== undefined) {
    return renderState;
  }

  const accordionLabel = (
    <Headline
      size="large"
      tag="h3"
    >
      {intl.formatMessage({ id: 'ui-users.accounts.title.feeFine' })}
    </Headline>
  );

  return (
    <Accordion
      id={accordionId}
      label={accordionLabel}
    >
      <Row>
        <EditCustomFieldsSection
          accordionId={accordionId}
          sectionId={CUSTOM_FIELDS_SECTION.FEES_FINES}
          isCreateMode={isCreateMode}
        />
      </Row>
    </Accordion>
  );
};

EditFeesFines.propTypes = propTypes;

export default EditFeesFines;
