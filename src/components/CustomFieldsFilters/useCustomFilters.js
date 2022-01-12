
import { useMemo } from 'react';

import { useStripes } from '@folio/stripes/core';
import {
  useCustomFieldsFetch,
  selectModuleId,
} from '@folio/stripes/smart-components';

// Loads custom fields for users module
const useCustomFields = () => {
  const { store: { getState }, okapi } = useStripes();
  const state = getState();
  const moduleId = useMemo(() => selectModuleId(state, 'users'), [state]);
  const { customFields } = useCustomFieldsFetch(okapi, moduleId, 'user');

  return customFields;
};

export default useCustomFields;
