import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';

import {
  Accordion,
  Row,
  Headline,
} from '@folio/stripes/components';

import EditCustomFieldsSection from '../EditCustomFieldsSection';
import { useCustomFieldsSection } from '../../../hooks/useCustomFieldsSection';
import { CUSTOM_FIELDS_SECTION } from '../../../constants';

const propTypes = {
  accordionId: PropTypes.string.isRequired,
};

const EditRequests = ({
  accordionId,
}) => {
  const intl = useIntl();
  const renderState = useCustomFieldsSection({ sectionId: CUSTOM_FIELDS_SECTION.REQUESTS });

  if (renderState !== undefined) {
    return renderState;
  }

  const accordionLabel = (
    <Headline
      size="large"
      tag="h3"
    >
      {intl.formatMessage({ id: 'ui-users.requests.title' })}
    </Headline>
  );

  return (
    <Accordion
      id={accordionId}
      label={accordionLabel}
    >
      <Row>
        <EditCustomFieldsSection
          sectionId={CUSTOM_FIELDS_SECTION.REQUESTS}
        />
      </Row>
    </Accordion>
  );
};

EditRequests.propTypes = propTypes;

export default EditRequests;
