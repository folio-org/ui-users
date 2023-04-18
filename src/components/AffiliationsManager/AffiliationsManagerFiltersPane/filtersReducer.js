import omit from 'lodash/omit';

import { AFFILIATIONS_FILTERS_ACTION_TYPES } from '../constants';

const {
  clearAll,
  clearFilter,
  updateFilters,
} = AFFILIATIONS_FILTERS_ACTION_TYPES;

const filtersReducer = (state, { type, payload }) => {
  switch (type) {
    case clearAll: {
      return {};
    }
    case clearFilter: {
      return (
        Object.fromEntries(
          Object
            .entries(state)
            .filter(([filterName]) => !filterName.startsWith(payload))
        )
      );
    }
    case updateFilters: {
      const [filterName, value] = payload;

      return {
        ...omit(state, filterName),
        ...(value ? { [filterName]: value } : {}),
      };
    }
    default:
      return state;
  }
};

export default filtersReducer;
