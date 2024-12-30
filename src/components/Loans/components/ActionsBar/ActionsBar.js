/**
 * Actions Bar
 */

import React from 'react';
import PropTypes from 'prop-types';
import css from './ActionsBar.css';

const propTypes = {
  show: PropTypes.bool,
  contentStart: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),
  contentEnd: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),
};

const ActionsBar = ({ show = true, contentStart, contentEnd }) => {
  if (!show) {
    return null;
  }

  return (
    <section className={css.actionsBar}>
      { contentStart && <div className={css.actionsBarStart}>{contentStart}</div>}
      { contentEnd && <div className={css.actionsBarEnd}>{contentEnd}</div>}
    </section>
  );
};

ActionsBar.propTypes = propTypes;

export default ActionsBar;
