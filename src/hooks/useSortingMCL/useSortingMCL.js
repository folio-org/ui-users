import { useCallback, useState } from 'react';

import { SORT_DIRECTIONS } from '../../constants';

const { asc, desc } = SORT_DIRECTIONS;

const useSortingMCL = (sortableFields) => {
  const [sortOrder, setSortOrder] = useState('');
  const [sortDirection, setSortDirection] = useState('');

  const toggleSortingDirection = useCallback(() => {
    setSortDirection((curr) => (curr === asc ? desc : asc));
  }, []);

  const changeSorting = useCallback((e, { name }) => {
    if (sortableFields && sortableFields.includes(name)) {
      if (name === sortOrder) {
        toggleSortingDirection();
      } else {
        setSortOrder(name);
        setSortDirection(asc);
      }
    }
  },
  [sortOrder, toggleSortingDirection, sortableFields]);

  return {
    sortOrder,
    sortDirection,
    changeSorting,
    setSortOrder,
    setSortDirection,
  };
};

export default useSortingMCL;
