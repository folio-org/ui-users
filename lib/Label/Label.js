import React from 'react';
import PropTypes from 'prop-types';
import css from './Label.css';

const Label = props => (<div className={css.root}>{props.children}</div>);

Label.propTypes = {
  children: PropTypes.node,
};

export default Label;
