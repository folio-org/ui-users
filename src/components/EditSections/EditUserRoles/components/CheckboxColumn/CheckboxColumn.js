import React, { memo } from 'react';
import PropTypes from 'prop-types';

import { noop } from 'lodash';
import { Checkbox } from '@folio/stripes/components';

import css from './CheckboxColumn.css';

const CheckboxColumn = memo(props => {
  const {
    value,
    checked = false,
    roleName,
    onChange = noop,
  } = props;

  return (
    <div // eslint-disable-line jsx-a11y/click-events-have-key-events
      tabIndex="0"
      role="button"
      className={css.selectableCellButton}
      data-test-select-item
      onClick={e => e.stopPropagation()}
    >
      <Checkbox
        name={`selected-${value}`}
        checked={checked}
        onChange={onChange}
        data-role-name={roleName}
      />
    </div>
  );
});

CheckboxColumn.propTypes = {
  value: PropTypes.string.isRequired,
  checked: PropTypes.bool,
  roleName: PropTypes.string.isRequired,
  onChange: PropTypes.func,
};

export default CheckboxColumn;
