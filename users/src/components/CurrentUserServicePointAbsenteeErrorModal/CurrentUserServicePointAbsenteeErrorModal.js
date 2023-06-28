import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { injectIntl } from 'react-intl';

import ErrorModal from '../ErrorModal';

const CurrentUserServicePointAbsenteeErrorModal = ({
  intl,
  history,
}) => {
  return (
    <ErrorModal
      open
      label={intl.formatMessage({ id: 'ui-users.errorModal.currentUserServicePointAbsentee.label' })}
      message={intl.formatMessage({ id: 'ui-users.errorModal.currentUserServicePointAbsentee.message' })}
      confirmButtonText={intl.formatMessage({ id: 'ui-users.errorModal.currentUserServicePointAbsentee.confirmButtonText' })}
      onClose={history.goBack}
    />
  );
};

CurrentUserServicePointAbsenteeErrorModal.propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  history: PropTypes.shape({
    goBack: PropTypes.func.isRequired,
  }).isRequired,
};

export default injectIntl(withRouter(CurrentUserServicePointAbsenteeErrorModal));
