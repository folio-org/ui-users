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
  isCreateMode: PropTypes.bool,
};

const EditLoans = ({
  accordionId,
  isCreateMode = false,
}) => {
  const intl = useIntl();
  const renderState = useCustomFieldsSection({ sectionId: CUSTOM_FIELDS_SECTION.LOANS });

  if (renderState !== undefined) {
    return renderState;
  }

  const accordionLabel = (
    <Headline
      size="large"
      tag="h3"
    >
      {intl.formatMessage({ id: 'ui-users.loans.title' })}
    </Headline>
  );

  return (
    <Accordion
      id={accordionId}
      label={accordionLabel}
    >
      <Row>
        <EditCustomFieldsSection
          sectionId={CUSTOM_FIELDS_SECTION.LOANS}
          isCreateMode={isCreateMode}
        />
      </Row>
    </Accordion>
  );
};

EditLoans.propTypes = propTypes;

export default EditLoans;
