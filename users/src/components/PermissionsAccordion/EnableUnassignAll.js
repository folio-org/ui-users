import React from 'react';
import PropTypes from 'prop-types';

import { OnChange } from 'react-final-form-listeners';

/**
 * Listen for changes to ${permissionsField} and call ${callback}
 * with a function that returns ${isEnabled} when the field changes.
 *
 * @param {string} permissionsField listen for change to this field
 * @param {function} callback function to call when permissionsField changes
 * @param {boolean} isEnabled value to pass to callback
 * @returns void
 */
const EnableUnassignAll = ({ permissionsField, callback, isEnabled }) => {
  return (
    <OnChange name={permissionsField}>
      {() => { callback(() => isEnabled); }}
    </OnChange>
  );
};

EnableUnassignAll.propTypes = {
  callback: PropTypes.func.isRequired,
  isEnabled: PropTypes.bool.isRequired,
  permissionsField: PropTypes.string.isRequired,
};

export default EnableUnassignAll;
