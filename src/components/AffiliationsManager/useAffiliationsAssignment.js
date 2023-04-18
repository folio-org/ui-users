import keyBy from 'lodash/keyBy';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

const useAffiliationsAssignment = ({ affiliations, tenants }) => {
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

  const toggle = useCallback(({ id }) => {
    setAssignment(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const toggleAll = useCallback(() => {
    setAssignment(prev => (
      Object.entries(prev).reduce((acc, [key]) => {
        acc[key] = !isAllAssigned;

        return acc;
      }, {})));
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
