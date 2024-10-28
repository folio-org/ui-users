import { render, screen, fireEvent } from '@folio/jest-config-stripes/testing-library/react';

import preRegistrationRecords from 'fixtures/preRegistrationRecords';
import buildStripes from '__mock__/stripes.mock';

import { createMemoryHistory } from 'history';
import { MemoryRouter, useHistory } from 'react-router-dom';

import { StripesConnectedSource } from '@folio/stripes/smart-components';

import PatronPreRegistrationRecordsContainer from './PatronPreRegistrationRecordsContainer';

jest.unmock('@folio/stripes/components');
jest.unmock('@folio/stripes/smart-components');
jest.mock('@folio/stripes/components', () => ({
  ...jest.requireActual('@folio/stripes/components'),
  SearchField: jest.fn((props) => (
    <input
      {...props}
    />
  )),
}));
jest.mock('../views/PatronsPreRegistrationListContainer/PatronsPreRegistrationListContainer', () => {
  return jest.fn(({ onClose, onNeedMoreData }) => (
    <div data-testid="mock-PatronsPreRegistrationListContainer">
      Mocked component PatronsPreRegistrationListContainer
      <button data-testid="close-button" type="button" onClick={onClose}>close</button>
      <button data-testid="need-more-button" type="button" onClick={() => onNeedMoreData(100, 1)}>Need more</button>
    </div>
  ));
});
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: jest.fn(),
}));

const STRIPES = buildStripes();
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
    },
    resultOffset: 100
  },
  stripes: {
    ...STRIPES,
    hasPerm: jest.fn().mockReturnValue(true),
  },
  history,
};

const renderPatronPreRegistrationRecordsContainer = (alteredProps) => render(
  <MemoryRouter>
    <PatronPreRegistrationRecordsContainer {...props} {...alteredProps} />
  </MemoryRouter>
);

describe('PatronPreRegistrationRecordsContainer', () => {
  let mockHistory;
  let mockSource;

  beforeEach(() => {
    // Set up the mock history object
    mockHistory = { push: jest.fn() };
    useHistory.mockReturnValue(mockHistory);

    // Mock the StripesConnectedSource instance
    mockSource = {
      fetchOffset: jest.fn(),
      fetchMore: jest.fn(),
    };

    jest.spyOn(StripesConnectedSource.prototype, 'fetchOffset').mockImplementation(mockSource.fetchOffset);
    jest.spyOn(StripesConnectedSource.prototype, 'fetchMore').mockImplementation(mockSource.fetchMore);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render', () => {
    renderPatronPreRegistrationRecordsContainer();
    expect(screen.getByTestId('mock-PatronsPreRegistrationListContainer')).toBeInTheDocument();
  });

  it('should call onClose method', () => {
    renderPatronPreRegistrationRecordsContainer();
    fireEvent.click(screen.getByTestId('close-button'));

    expect(mockHistory.push).toHaveBeenCalledWith('/users?sort=name');
  });

  it('should call onNeedMoreData method', () => {
    renderPatronPreRegistrationRecordsContainer();
    fireEvent.click(screen.getByTestId('need-more-button'));

    expect(mockSource.fetchOffset).toHaveBeenCalledWith(1);
  });

  it('should call onNeedMoreData method', () => {
    const alteredProps = {
      ...props,
      mutator: {
        ...props.mutator,
        resultOffset: 0
      },
    };
    renderPatronPreRegistrationRecordsContainer(alteredProps);
    fireEvent.click(screen.getByTestId('need-more-button'));

    expect(mockSource.fetchMore).toHaveBeenCalledWith(100);
  });

  describe('when logged in user user do not have permission to view staging records', () => {
    it('should render NoPermissionMessage component', () => {
      const alteredProps = {
        ...props,
        stripes: {
          ...props.stripes,
          hasPerm: jest.fn().mockReturnValue(false),
        },
      };

      renderPatronPreRegistrationRecordsContainer(alteredProps);

      expect(screen.getByText('ui-users.stagingRecords.message.noAccessToStagingRecordsPage')).toBeDefined();
    });
  });
});
