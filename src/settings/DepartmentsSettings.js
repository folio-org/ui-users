import React, { useMemo } from 'react';
import {
  FormattedMessage,
  useIntl,
} from 'react-intl';

import { NoValue } from '@folio/stripes/components';
import { ControlledVocab } from '@folio/stripes/smart-components';
import { useStripes } from '@folio/stripes/core';

const DepartmentsSettings = () => {
  const { formatMessage } = useIntl();
  const stripes = useStripes();
  const ConnectedControlledVocab = useMemo(() => stripes.connect(ControlledVocab), [stripes]);

  const validate = (item, index, items) => {
    const filteredDepartments = items.filter((department, i) => i !== index);
    const errors = {};

    if (filteredDepartments.find(department => department.name === item.name)) {
      errors.name = <FormattedMessage id="ui-users.settings.departments.name.error" />;
    }

    if (filteredDepartments.find(department => department.code === item.code)) {
      errors.code = <FormattedMessage id="ui-users.settings.departments.code.error" />;
    }

    if (!item.code) {
      errors.code = <FormattedMessage id="ui-users.settings.departments.code.required" />;
    }

    return errors;
  };

  return (
    <ConnectedControlledVocab
      stripes={stripes}
      baseUrl="departments"
      records="departments"
      label={formatMessage({ id: 'ui-users.settings.departments' })}
      labelSingular={formatMessage({ id: 'ui-users.settings.department' })}
      objectLabel={<FormattedMessage id="ui-users.settings.departments.users" />}
      visibleFields={['name', 'code']}
      columnMapping={{
        name: formatMessage({ id: 'ui-users.settings.departments.name' }),
        code: formatMessage({ id: 'ui-users.settings.departments.code' }),
      }}
      nameKey="department"
      id="departments"
      sortby="name"
      formatter={{
        numberOfObjects: item => item.usageNumber || <NoValue />,
      }}
      validate={validate}
      actionSuppressor={{
        delete: item => item.usageNumber,
        edit: () => false,
      }}
    />
  );
};

export default DepartmentsSettings;
