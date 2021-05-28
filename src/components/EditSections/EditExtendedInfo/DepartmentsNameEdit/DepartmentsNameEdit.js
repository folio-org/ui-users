import React from 'react';
import {
  FormattedMessage,
  useIntl,
} from 'react-intl';
import { Field } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';

import {
  Select,
  RepeatableField,
} from '@folio/stripes/components';

import { departmentsShape } from '../../../../shapes';

import css from './DepartmentsNameEdit.css';

const DepartmentsNameEdit = ({ departments }) => {
  const { formatMessage } = useIntl();
  const defaultDepartment = {
    label: formatMessage({ id: 'ui-users.extended.department.default' }),
    value: '',
  };
  const formattedDepartments = departments.map(({ id, name }) => ({
    value: id,
    label: name,
  }));

  return (
    <div className={css.repeatableFieldRemoveItem}>
      <FieldArray
        addLabel={<FormattedMessage id="ui-users.extended.department.add" />}
        legend={<FormattedMessage id="ui-users.extended.department.name" />}
        id="department-name"
        component={RepeatableField}
        name="departments"
        onAdd={fields => fields.push()}
        renderField={field => (
          <Field
            component={Select}
            name={field}
            dataOptions={[defaultDepartment, ...formattedDepartments]}
          />
        )}
      />
    </div>
  );
};

DepartmentsNameEdit.propTypes = { departments: departmentsShape };

export default DepartmentsNameEdit;
