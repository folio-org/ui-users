import React from 'react';
import { v4 as uuidv4 } from 'uuid';

import { FormattedMessage } from 'react-intl';

import css from './Slider.css';

const formatMessageMapping = (label) => (`ui-users.information.profilePic.modal.${label}`);

const Slider = ({ value, handleChange, min, max, step, label }) => {
  const id = `${uuidv4()}`;

  return (
    <>
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
          id={id}
          type="range"
          // className={css.slider}
          defaultValue={value}
          min={min}
          max={max}
          step={step}
          onChange={handleChange}
          aria-label={label}
          style={{ width:'100%', marginLeft: '2px' }}
        />
      </label>

    </>
  );
};

export default Slider;
