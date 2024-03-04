import React from 'react';
import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';

import { FormattedMessage } from 'react-intl';

import css from './Slider.css';

const formatMessageMapping = (label) => (`ui-users.information.profilePicture.localFile.modal.${label}`);

const Slider = ({ value, handleChange, min, max, step, label }) => {
  const id = `${uuidv4()}`;

  return (
    <label
      htmlFor={id}
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: '5px',
        fontWeight: '700'
      }}
    >
      <FormattedMessage id={formatMessageMapping(label)} />
      <input
        className={css.slider}
        id={id}
        type="range"
        defaultValue={value}
        min={min}
        max={max}
        step={step}
        onChange={handleChange}
        aria-label={label}
        style={{ width:'100%', marginLeft: '2px' }}
      />
    </label>
  );
};

Slider.propTypes = {
  value: PropTypes.number,
  handleChange: PropTypes.func,
  min: PropTypes.number,
  max: PropTypes.number,
  step: PropTypes.number,
  label: PropTypes.string,
};

export default Slider;
