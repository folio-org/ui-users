import React from 'react';
import {
  FormattedMessage,
} from 'react-intl';
import PropTypes from 'prop-types';
import { Field } from 'react-final-form';
import isEqual from 'lodash/isEqual';

import { MultiSelection } from '@folio/stripes/components';

import { departmentsShape } from '../../../../shapes';

const DepartmentsNameEdit = ({ departments, disabled }) => {
  const formattedDepartments = departments.map(({ id, name }) => ({
    value: id,
    label: name,
  }));

  return (
    <Field
      id="department-name"
      name="departments"
      label={<FormattedMessage id="ui-users.extended.department.name" />}
      disabled={disabled}
      dataOptions={formattedDepartments}
      isEqual={isEqual}
      component={MultiSelection}
    />
  );
};

DepartmentsNameEdit.propTypes = {
  departments: departmentsShape,
  disabled: PropTypes.bool
};

export default DepartmentsNameEdit;
