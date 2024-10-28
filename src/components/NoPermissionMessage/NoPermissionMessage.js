import {
  FormattedMessage,
} from 'react-intl';
import PropTypes from 'prop-types';

import css from './NoPermissionMessage.css';

const NoPermissionMessage = ({ id }) => {
  return (
    <div
      data-testid="noPermissionWrapper"
      className={css.wrapper}
    >
      <FormattedMessage id={id} />
    </div>
  );
};

NoPermissionMessage.propTypes = {
  id: PropTypes.string.isRequired
};

export default NoPermissionMessage;
