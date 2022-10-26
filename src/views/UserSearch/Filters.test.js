import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { waitFor } from '@testing-library/react';
import '../../../test/jest/__mock__/matchMedia.mock';

import { statusFilter } from '../../constants';

import Filters from './Filters';
import { Select } from '@folio/stripes-components';

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

const stateMock=jest.fn();
const filterHandlers = {
  state: stateMock,
  checkbox: () => {},
  clear: () => {},
  clearGroup: () => {},
  reset: () => {},
};

const onChangeMock=jest.fn();
const renderFilters = (props) => render(<Filters {...props} />);
const initialProps = {
  onChange: onChangeMock,
  activeFilters: {},
  intl: {
    formatMessage: jest.fn(),
  },
  resources: {
    patronGroups:{ records: [{ group: 'grouptest', id: 'idtest'}]},
    departments:{ records: [{ name: 'nametest', id: 'idtest1'}]},
    tags: { records: [{ label: 'labeltest'}]},
  },
  onChangeHandlers: filterHandlers,
  resultOffset: {
    replace: jest.fn(),
  },
};
  
describe('Filters', () => {
    /*beforeEach(() => {
      render(
        <Filters
          {...initialProps}
        />
      );
    });*/
  
  describe('Loss type filter', () => {
    it('should render loss type accordion', () => {
      renderFilters(initialProps);
      //screen.debug(undefined, Infinity);
      expect(screen.getByText('ui-users.status')).toBeTruthy();
    });
  });

  it('Checking on change handlers', () => {
    renderFilters(initialProps);
    fireEvent.click(screen.getByText('ui-users.filters.status.inactive'));
    //screen.debug(undefined, Infinity);
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
});
  
