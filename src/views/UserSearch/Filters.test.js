import React from 'react';
import { fireEvent, render, screen } from '@folio/jest-config-stripes/testing-library/react';
import '../../../test/jest/__mock__/matchMedia.mock';

import Filters from './Filters';
import { isConsortiumEnabled } from '../../components/util';

jest.unmock('@folio/stripes/components');

jest.mock('../../components/util', () => ({
  isConsortiumEnabled: jest.fn(),
}));

const stateMock = jest.fn();
const filterHandlers = {
  state: stateMock,
  checkbox: () => {},
  clear: () => {},
  clearGroup: () => {},
  reset: () => {},
};

const onChangeMock = jest.fn();
const renderFilters = (props) => render(<Filters {...props} />);
const initialProps = {
  onChange: onChangeMock,
  activeFilters: {},
  intl: {
    formatMessage: jest.fn(),
  },
  resources: {
    patronGroups:{ records: [{ group: 'grouptest', id: 'idtest' }] },
    departments:{ records: [{ name: 'nametest', id: 'idtest1' }] },
    tags: { records: [{ label: 'labeltest' }] },
  },
  onChangeHandlers: filterHandlers,
  resultOffset: {
    replace: jest.fn(),
  },
  stripes: {
    hasInterface: jest.fn(),
  },
};

describe('Filters', () => {
  it('should check component render', () => {
    renderFilters(initialProps);

    expect(screen.getByText('ui-users.status')).toBeTruthy();
  });

  it('should check on change handlers', () => {
    renderFilters(initialProps);

    fireEvent.click(screen.getByText('ui-users.filters.status.inactive'));

    expect(stateMock).toHaveBeenCalled();
  });

  it('should check clear Group', () => {
    const props = { ...initialProps, activeFilters: { active: ['true'] } };

    renderFilters(props);

    fireEvent.click(screen.getAllByRole('button', { name: 'stripes-components.filterGroups.clearFilterSetLabel' })[0]);

    expect(stateMock).toHaveBeenCalled();
  });

  it('should check presence of patronGroup filter', () => {
    renderFilters(initialProps);

    expect(screen.getByText('ui-users.information.patronGroup')).toBeInTheDocument();
  });

  it('should check presence of tags filter', () => {
    renderFilters(initialProps);

    expect(screen.getByText('ui-users.tags')).toBeInTheDocument();
  });

  it('should check presence of departments filter', () => {
    renderFilters(initialProps);

    expect(screen.getByText('ui-users.departments')).toBeInTheDocument();
  });

  it('should display user-type filter for consortia tenants', () => {
    isConsortiumEnabled.mockReturnValue(true);

    renderFilters(initialProps);

    expect(screen.getByText('ui-users.userType')).toBeInTheDocument();
  });

  it('should hide user-types filter for non-consortia tenants', () => {
    isConsortiumEnabled.mockReturnValue(false);

    renderFilters(initialProps);

    expect(screen.queryByText('ui-users.userType')).not.toBeInTheDocument();
  });

  describe('displayClearButton conditional behavior', () => {
    it('should not show any clear buttons when no filters are active', () => {
      renderFilters(initialProps);

      expect(screen.queryAllByRole('button', { name: 'stripes-components.filterGroups.clearFilterSetLabel' })).toHaveLength(0);
    });

    it('should show clear button for status accordion only when active filter is set', () => {
      const props = { ...initialProps, activeFilters: { active: ['true'] } };

      renderFilters(props);

      expect(screen.getAllByRole('button', { name: 'stripes-components.filterGroups.clearFilterSetLabel' })).toHaveLength(1);
    });

    it('should show clear button for patron group accordion only when pg filter is set', () => {
      const props = { ...initialProps, activeFilters: { pg: ['idtest'] } };

      renderFilters(props);

      expect(screen.getAllByRole('button', { name: 'stripes-components.filterGroups.clearFilterSetLabel' })).toHaveLength(1);
    });

    it('should show clear button for departments accordion only when departments filter is set', () => {
      const props = { ...initialProps, activeFilters: { departments: ['idtest1'] } };

      renderFilters(props);

      expect(screen.getAllByRole('button', { name: 'stripes-components.filterGroups.clearFilterSetLabel' })).toHaveLength(1);
    });

    it('should show clear button for tags accordion only when tags filter is set', () => {
      const props = { ...initialProps, activeFilters: { tags: ['labeltest'] } };

      renderFilters(props);

      expect(screen.getAllByRole('button', { name: 'stripes-components.filterGroups.clearFilterSetLabel' })).toHaveLength(1);
    });

    it('should show clear button for user types accordion only when userType filter is set', () => {
      isConsortiumEnabled.mockReturnValue(true);

      const props = { ...initialProps, activeFilters: { userType: ['patron'] } };

      renderFilters(props);

      expect(screen.getAllByRole('button', { name: 'stripes-components.filterGroups.clearFilterSetLabel' })).toHaveLength(1);
    });

    it('should show clear buttons for each accordion that has active filters', () => {
      const props = { ...initialProps, activeFilters: { active: ['true'], pg: ['idtest'], tags: ['labeltest'] } };

      renderFilters(props);

      expect(screen.getAllByRole('button', { name: 'stripes-components.filterGroups.clearFilterSetLabel' })).toHaveLength(3);
    });
  });
});
