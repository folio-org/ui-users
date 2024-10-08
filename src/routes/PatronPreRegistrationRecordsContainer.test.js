import { screen } from '@folio/jest-config-stripes/testing-library/react';

import { createMemoryHistory } from 'history';

import renderWithRouter from 'helpers/renderWithRouter';
import preRegistrationRecords from 'fixtures/preRegistrationRecords';
import buildStripes from '__mock__/stripes.mock';

import PatronPreRegistrationRecordsContainer from './PatronPreRegistrationRecordsContainer';

jest.unmock('@folio/stripes/components');
jest.mock('@folio/stripes/components', () => ({
  ...jest.requireActual('@folio/stripes/components'),
  SearchField: jest.fn((props) => (
    <input
      {...props}
    />
  )),
}));

const history = createMemoryHistory();
history.push = jest.fn();
const props = {
  resources: {
    patronPreRegistrationRecords: {
      records: preRegistrationRecords,
    },
    resultCount: 1,
    resultOffset: 0,
  },
  mutator: {
    patronPreRegistrationRecords:{
      GET: jest.fn(),
    }
  },
  stripes: buildStripes(),
  history,
};
const renderPatronPreRegistrationRecordsContainer = (extraProps) => renderWithRouter(
  <PatronPreRegistrationRecordsContainer {...props} {...extraProps} />
);

describe('PatronPreRegistrationRecordsContainer', () => {
  it('should render', () => {
    renderPatronPreRegistrationRecordsContainer();
    expect(screen.getByText('ui-users.stagingRecords.list.searchResults')).toBeInTheDocument();
  });

  it('should display search field', () => {
    renderPatronPreRegistrationRecordsContainer();
    expect(screen.getByPlaceholderText('ui-users.stagingRecords.search.placeholder')).toBeDefined();
  });

  it('should focus on search box', () => {
    renderPatronPreRegistrationRecordsContainer();
    const input = document.getElementsByTagName('input')[0];
    expect(input).toHaveFocus();
  });
});
