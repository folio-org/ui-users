import keyBy from 'lodash/keyBy';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

const useAffiliationsAssignment = ({ affiliations, tenants, onUnassignedCheck }) => {
  const [assignment, setAssignment] = useState({});

  useEffect(() => {
    setAssignment(() => {
      const affiliationsMap = keyBy(affiliations, 'tenantId');

      return tenants.reduce((acc, { id }) => {
        acc[id] = Boolean(affiliationsMap[id]);

        return acc;
      }, {});
    });
  }, [affiliations, tenants]);

  const isAllAssigned = useMemo(() => (
    Object.values(assignment).every(value => Boolean(value))
  ), [assignment]);

  const totalAssigned = useMemo(() => (
    Object.values(assignment).filter(Boolean).length
  ), [assignment]);

  const checkUnassigned = useCallback((_assignment) => {
    onUnassignedCheck(affiliations.some(({ tenantId }) => !_assignment[tenantId]));
  }, [affiliations, onUnassignedCheck]);

  const toggle = useCallback(({ id }) => {
    setAssignment(prev => {
      const newAssignment = { ...prev, [id]: !prev[id] };

      checkUnassigned(newAssignment);

      return newAssignment;
    });
  }, [checkUnassigned]);

  const toggleAll = useCallback(() => {
    setAssignment(prev => {
      const newAssignment = Object.entries(prev).reduce((acc, [key]) => {
        acc[key] = !isAllAssigned;

        return acc;
      }, {});

      checkUnassigned(newAssignment);

      return newAssignment;
    });
  }, [checkUnassigned, isAllAssigned]);

  return {
    assignment,
    isAllAssigned,
    toggle,
    toggleAll,
    totalAssigned,
  };
};

export default useAffiliationsAssignment;
