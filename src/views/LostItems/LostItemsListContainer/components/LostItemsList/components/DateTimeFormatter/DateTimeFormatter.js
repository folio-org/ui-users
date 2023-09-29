import React from 'react';
import PropTypes from 'prop-types';
import {
  FormattedDate,
  FormattedTime,
} from '@folio/stripes/components';

const DateTimeFormatter = ({ value }) => {
  return (
    <>
      <FormattedDate value={value} />, <FormattedTime value={value} />
    </>
  );
};

DateTimeFormatter.propTypes = {
  value: PropTypes.string.isRequired,
};

export default DateTimeFormatter;
