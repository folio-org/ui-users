import { useNamespace, useOkapiKy, useStripes } from '@folio/stripes/core';
import { useMemo } from 'react';
import { useQuery } from 'react-query';

function useAllRolesData() {
  const stripes = useStripes();
  const ky = useOkapiKy();

  const [namespace] = useNamespace();

  const { data, isLoading } = useQuery([namespace, 'user-roles'], () => {
    return ky.get(`roles?limit=${stripes.config.maxUnpagedResourceCount}&query=cql.allRecords=1 sortby name`).json();
  });

  const allRolesMapStructure = useMemo(() => {
    const rolesMap = new Map();

    if (!data?.roles) return rolesMap;

    data.roles.forEach(role => rolesMap.set(role.id, role));
    return rolesMap;
  }, [data]);

  return { data, isLoading, allRolesMapStructure };
}

export default useAllRolesData;
