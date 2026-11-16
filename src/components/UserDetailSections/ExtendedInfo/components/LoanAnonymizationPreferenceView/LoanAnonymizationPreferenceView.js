import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  Col,
  KeyValue,
  Row,
} from '@folio/stripes/components';

import { useUserSpecificLoanAnonymization } from '../../../../../hooks';
import {
  LOAN_ANONYMIZATION_PREFERENCE,
  LOAN_ANONYMIZATION_PREFERENCE_OPTIONS,
} from '../../../../../constants';

const LoanAnonymizationPreferenceView = ({ preference }) => {
  const { isEnabled } = useUserSpecificLoanAnonymization();

  if (!isEnabled) {
    return null;
  }

  // A missing value means "according to library policy"; an unknown value is shown as stored.
  const option = LOAN_ANONYMIZATION_PREFERENCE_OPTIONS.find(
    ({ value }) => value === (preference || LOAN_ANONYMIZATION_PREFERENCE.LIBRARY_POLICY),
  );

  return (
    <Row>
      <Col
        xs={12}
        md={3}
      >
        <KeyValue
          label={<FormattedMessage id="ui-users.extended.loanAnonymizationPreference" />}
          data-testid="loan-anonymization-preference"
        >
          {option ? <FormattedMessage id={option.labelId} /> : preference}
        </KeyValue>
      </Col>
    </Row>
  );
};

LoanAnonymizationPreferenceView.propTypes = {
  preference: PropTypes.string,
};

export default LoanAnonymizationPreferenceView;
