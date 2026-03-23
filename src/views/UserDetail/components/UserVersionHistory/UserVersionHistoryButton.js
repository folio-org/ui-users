import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';

import { IconButton, Tooltip } from '@folio/stripes/components';
import { useStripes } from '@folio/stripes/core';

import { useIsAuditEnabled } from '../../../../hooks/useAuditSettingsQuery';

const UserVersionHistoryButton = ({ disabled, onClick }) => {
  const intl = useIntl();
  const stripes = useStripes();
  const hasPermission = stripes.hasPerm('ui-users.versionHistory.view');
  const { isEnabled, isLoading } = useIsAuditEnabled();

  if (!hasPermission || isLoading || !isEnabled) return null;

  const tooltip = intl.formatMessage({ id: 'ui-users.versionHistory.button.tooltip' });

  return (
    <Tooltip
      text={tooltip}
      id="version-history-tooltip"
    >
      {({ ref, ariaIds }) => (
        <IconButton
          ref={ref}
          aria-labelledby={ariaIds.text}
          disabled={disabled}
          icon="clock"
          id="version-history-btn"
          onClick={onClick}
        />
      )}
    </Tooltip>
  );
};

UserVersionHistoryButton.propTypes = {
  disabled: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
};

export default UserVersionHistoryButton;
