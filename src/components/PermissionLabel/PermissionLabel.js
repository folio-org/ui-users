import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { getPermissionLabelString } from '../data/converters/permission';

const PermissionLabel = ({
  intl: { formatMessage },
  permission,
  showRaw,
}) => (
  getPermissionLabelString(permission, formatMessage, showRaw)
);

PermissionLabel.propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  permission: PropTypes.shape({
    displayName: PropTypes.string,
    permissionName: PropTypes.string.isRequired,
  }).isRequired,
  showRaw: PropTypes.bool,
};

export default injectIntl(PermissionLabel);
