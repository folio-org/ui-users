import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { ConfirmationModal } from '@folio/stripes/components';

import { renderBold } from './utils';
import css from './VersionHistoryWarningModal.css';

const VersionHistoryWarningModal = ({ open, warnings, onConfirm, onCancel }) => {
  const message = warnings.map((warning) => (
    <p key={warning.type} className={css.warning}>
      <FormattedMessage
        id={`ui-users.settings.versionHistory.warning.${warning.type}`}
        values={{
          period: warning.formattedPeriod,
          b: renderBold,
        }}
      />
    </p>
  ));

  return (
    <ConfirmationModal
      open={open}
      heading={<FormattedMessage id="ui-users.settings.versionHistory.warning.title" />}
      message={message}
      bodyTag="div"
      buttonStyle="danger"
      confirmLabel={<FormattedMessage id="ui-users.settings.versionHistory.warning.confirm" />}
      cancelLabel={<FormattedMessage id="ui-users.settings.versionHistory.warning.cancel" />}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
};

VersionHistoryWarningModal.propTypes = {
  open: PropTypes.bool.isRequired,
  warnings: PropTypes.arrayOf(PropTypes.shape({
    type: PropTypes.string.isRequired,
    formattedPeriod: PropTypes.string,
  })).isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default VersionHistoryWarningModal;
