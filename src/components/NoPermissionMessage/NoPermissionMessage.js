import PropTypes from 'prop-types';

import css from './NoPermissionMessage.css';

const NoPermissionMessage = ({ content }) => {
  return (
    <div className={css.wrapper}>
      <p className={css.content}>{content}</p>
    </div>
  );
};

NoPermissionMessage.propTypes = {
  content: PropTypes.string.isRequired,
};

export default NoPermissionMessage;
