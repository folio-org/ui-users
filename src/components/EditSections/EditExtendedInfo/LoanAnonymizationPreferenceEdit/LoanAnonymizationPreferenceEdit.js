import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { Field } from 'react-final-form';

import {
  Col,
  Row,
  Select,
} from '@folio/stripes/components';

import { useUserSpecificLoanAnonymization } from '../../../../hooks';
import {
  LOAN_ANONYMIZATION_PREFERENCE,
  LOAN_ANONYMIZATION_PREFERENCE_OPTIONS,
} from '../../../../constants';

// A missing value means "according to library policy". Show it as selected without writing it into
// the form values, so users that were never touched are saved without the field.
const formatPreference = value => value || LOAN_ANONYMIZATION_PREFERENCE.LIBRARY_POLICY;

const LoanAnonymizationPreferenceEdit = ({ disabled = false }) => {
  const { formatMessage } = useIntl();
  const { isEnabled } = useUserSpecificLoanAnonymization();

  // Hidden while the tenant doesn't allow user-specific anonymization or the setting can't be read.
  // A stored value stays in the form values and is saved unchanged.
  if (!isEnabled) {
    return null;
  }

  const dataOptions = LOAN_ANONYMIZATION_PREFERENCE_OPTIONS.map(({ value, labelId }) => ({
    value,
    label: formatMessage({ id: labelId }),
  }));

  return (
    <Row>
      <Col
        xs={12}
        md={3}
      >
        <Field
          label={formatMessage({ id: 'ui-users.extended.loanAnonymizationPreference' })}
          name="loanAnonymizationPreference"
          id="adduser_loananonymizationpreference"
          component={Select}
          dataOptions={dataOptions}
          format={formatPreference}
          disabled={disabled}
          fullWidth
        />
      </Col>
    </Row>
  );
};

LoanAnonymizationPreferenceEdit.propTypes = {
  disabled: PropTypes.bool,
};

export default LoanAnonymizationPreferenceEdit;
