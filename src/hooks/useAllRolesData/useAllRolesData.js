import { useNamespace, useOkapiKy, useStripes } from '@folio/stripes/core';
import { useQuery } from 'react-query';

function useAllRolesData() {
  const stripes = useStripes();
  const ky = useOkapiKy();

  const [namespace] = useNamespace();

  return useQuery([namespace, 'user-roles'], () => {
    return ky.get(`roles?limit=${stripes.config.maxUnpagedResourceCount}&query=cql.allRecords=1 sortby name`).json();
  });
}

export default useAllRolesData;
