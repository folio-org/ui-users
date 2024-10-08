import { useState } from 'react';
import { filtersConfig, getInitialFiltersState } from '../../helpers';

export default function useRolesModalFilters() {
  const [filters, setFilters] = useState(getInitialFiltersState([filtersConfig]));

  const onChangeFilter = ({ target: { name, checked } }) => {
    setFilters((prevState) => {
      const updatedFilters = { ...prevState };
      if (checked) {
        updatedFilters[name] = checked;
      } else {
        delete updatedFilters[name];
      }

      return updatedFilters;
    });
  };

  const onClearFilter = (filterName) => {
    setFilters((prevState) => {
      const updatedFilters = { ...prevState };

      Object.keys(updatedFilters).forEach((key) => {
        if (key.startsWith(filterName)) {
          delete updatedFilters[key];
        }
      });

      return updatedFilters;
    });
  };

  const resetFilters = () => setFilters(getInitialFiltersState([filtersConfig]));

  return { filters, onChangeFilter, onClearFilter, resetFilters };
}
