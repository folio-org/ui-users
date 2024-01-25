import { waitFor, fireEvent } from '@folio/jest-config-stripes/testing-library/react';

import renderWithRouter from 'helpers/renderWithRouter';
import PatronNoticePrintJobsContainer from './PatronNoticePrintJobsContainer';


jest.mock('../views/PatronNoticePrintJobs', () => {
  return jest.fn(({ onClose }) => (<button type="button" data-testid="close-button" onClick={onClose}>Close</button>));
});

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

const mockMutator = {
  printingJob: {
    GET: jest.fn(),
    reset: jest.fn(),
  },
};

const mockResources = {
  entries: {
    records: [],
  },
};

const renderPatronNoticePrintJobsContainer = (extraProps) => renderWithRouter(
  <PatronNoticePrintJobsContainer mutator={mockMutator} resources={mockResources} {...extraProps} />
);

describe('PatronNoticePrintJobsContainer', () => {
  it('should render PatronNoticePrintJobs', () => {
    const { container } = renderPatronNoticePrintJobsContainer();
    expect(container).toBeInTheDocument();
  });

  it('should go back if location state exists', async () => {
    const { getByTestId, history } = renderPatronNoticePrintJobsContainer({
      location: { state: { from: '/previous-page' } }
    });

    fireEvent.click(getByTestId('close-button'));

    await waitFor(() => {
      expect(history.goBack).toHaveBeenCalled();
    });
  });


  it('should redirect to /users?sort=name if location state does not exist', async () => {
    const { getByTestId, history } = renderPatronNoticePrintJobsContainer({
      location: {}
    });

    fireEvent.click(getByTestId('close-button'));

    await waitFor(() => {
      expect(history.push).toHaveBeenCalled();
    });
  });
});
