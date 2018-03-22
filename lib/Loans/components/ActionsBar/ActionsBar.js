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

const defaultProps = {
  show: true,
};

const ActionsBar = ({ show, contentStart, contentEnd }) => {
  if (!show) {
    return null;
  }

  return (
    <section className={css.actionsBar}>
      { contentStart && <div className={css.actionsBarResults}>{contentStart}</div>}
      { contentEnd && <div className={css.actionsBarButtons}>{contentEnd}</div>}
    </section>
  );
};

ActionsBar.propTypes = propTypes;
ActionsBar.defaultProps = defaultProps;

export default ActionsBar;
