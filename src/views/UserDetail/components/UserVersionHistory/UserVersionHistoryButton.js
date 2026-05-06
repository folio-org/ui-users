import { useEffect } from 'react';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';

import {
  IconButton,
  Loading,
  Tooltip,
} from '@folio/stripes/components';
import { useStripes } from '@folio/stripes/core';

import { useIsAuditEnabled } from '../../../../hooks/useAuditSettingsQuery';

const UserVersionHistoryButton = ({ disabled, onClick }) => {
  const intl = useIntl();
  const stripes = useStripes();
  const hasPermission = stripes.hasPerm('ui-users.settings.version-history.view');
  const { isEnabled, isLoading, isError } = useIsAuditEnabled({ enabled: hasPermission });

  useEffect(() => {
    if (isError) {
      stripes.logger.log('audit', 'Failed to load audit settings; user version history button will be hidden');
    }
  }, [isError, stripes.logger]);

  if (!hasPermission) return null;
  if (isLoading) return <Loading data-testid="version-history-loading" />;
  if (isError || !isEnabled) return null;

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
