import keyBy from 'lodash/keyBy';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

const useAffiliationsAssignment = ({ affiliations, tenants, affiliationIds = [] }) => {
  const [assignment, setAssignment] = useState({});

  useEffect(() => {
    setAssignment(() => {
      const affiliationsMap = keyBy(affiliations, 'tenantId');
      return tenants.reduce((acc, { id, isCentral }) => {
        const isValidAffiliation = !isCentral && affiliationIds.includes(id);
        if (isValidAffiliation) {
          acc[id] = Boolean(affiliationsMap[id]);
        }

        return acc;
      }, {});
    });
  }, [affiliationIds, affiliations, tenants]);

  const isAllAssigned = useMemo(() => (
    Object.values(assignment).every(value => Boolean(value))
  ), [assignment]);

  const totalAssigned = useMemo(() => (
    Object.values(assignment).filter(Boolean).length
  ), [assignment]);

  const toggle = useCallback(({ id }) => {
    setAssignment(prev => {
      const newAssignment = { ...prev, [id]: !prev[id] };

      return newAssignment;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setAssignment(prev => {
      const newAssignment = Object.entries(prev).reduce((acc, [key]) => {
        acc[key] = !isAllAssigned;

        return acc;
      }, {});

      return newAssignment;
    });
  }, [isAllAssigned]);

  return {
    assignment,
    isAllAssigned,
    toggle,
    toggleAll,
    totalAssigned,
  };
};

export default useAffiliationsAssignment;
