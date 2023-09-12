import React from 'react';
import { fireEvent, render, screen } from '@folio/jest-config-stripes/testing-library/react';
import '../../../test/jest/__mock__/matchMedia.mock';

import Filters from './Filters';
import { isConsortiumEnabled } from '../../components/util';

jest.unmock('@folio/stripes/components');
jest.unmock('@folio/stripes/smart-components');

jest.mock('@folio/stripes/smart-components', () => {
  // eslint-disable-next-line global-require
  const customField = require('fixtures/multiSelectCustomField');
  return {
    // eslint-disable-next-line global-require
    ...jest.requireActual('@folio/stripes/smart-components'),
    useCustomFields: jest.fn(() => [[customField]]),
  };
});
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
  it('Component render testing', () => {
    renderFilters(initialProps);
    expect(screen.getByText('ui-users.status')).toBeTruthy();
  });

  it('Checking on change handlers', () => {
    renderFilters(initialProps);
    fireEvent.click(screen.getByText('ui-users.filters.status.inactive'));
    expect(stateMock).toHaveBeenCalled();
  });

  it('Checking clear Group', () => {
    renderFilters(initialProps);
    fireEvent.click(screen.getAllByLabelText('Clear selected filters for "ui-users.departments"')[0]);
    expect(stateMock).toHaveBeenCalled();
  });

  it('Checking presence of patronGroup filter', () => {
    renderFilters(initialProps);
    expect(screen.getByText('ui-users.information.patronGroup')).toBeInTheDocument();
  });

  it('Checking presence of tags filter', () => {
    renderFilters(initialProps);
    expect(screen.getByText('ui-users.tags')).toBeInTheDocument();
  });

  it('Checking presence of departments filter', () => {
    renderFilters(initialProps);
    expect(screen.getByText('ui-users.departments')).toBeInTheDocument();
  });

  it('Checking presence of user types filter', () => {
    isConsortiumEnabled.mockReturnValue(true);
    renderFilters(initialProps);
    expect(screen.getByText('ui-users.userType')).toBeInTheDocument();
  });

  it('Checking presence of user types filter', () => {
    isConsortiumEnabled.mockReturnValue(false);
    renderFilters(initialProps);
    expect(screen.queryByText('ui-users.userType')).not.toBeInTheDocument();
  });
});
