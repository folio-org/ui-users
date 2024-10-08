import {
  screen,
  waitFor,
} from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';
import '../../test/jest/__mock__';
import renderWithRouter from 'helpers/renderWithRouter';

import PatronPreRegistrationRecordsContainer from './PatronPreRegistrationRecordsContainer';

jest.mock('../views/PatronsPreRegistrationListContainer/PatronsPreRegistrationList', () => jest.fn(() => <div>PatronsPreRegistrationList</div>));

jest.mock('history', () => {
  return {
    createMemoryHistory: jest.fn(() => ({
      push: jest.fn(),
      location: {},
      listen: jest.fn(),
      goBack: jest.fn(),
    })),
  };
});

const props = {
  resources: {
    patronPreRegistrationRecords: {
      records: [],
    },
    resultCount: 0,
    resultOffset: 0,
  },
  mutator: {
    patronPreRegistrationRecords:{
      GET: jest.fn(),
    }
  },
  stripes: {
    logger: {
      log: jest.fn()
    }
  },
};
const renderPatronPreRegistrationRecordsContainer = (extraProps) => renderWithRouter(
  <PatronPreRegistrationRecordsContainer {...props} {...extraProps} />
);

describe('PatronPreRegistrationRecordsContainer', () => {
  it('should render', () => {
    renderPatronPreRegistrationRecordsContainer();
    expect(screen.getByText('PatronsPreRegistrationList')).toBeInTheDocument();
  });
});
