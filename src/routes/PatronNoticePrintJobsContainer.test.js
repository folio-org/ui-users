import React from 'react';

import renderWithRouter from 'helpers/renderWithRouter';
import PatronNoticePrintJobsContainer from './PatronNoticePrintJobsContainer';

jest.mock('../views/PatronNoticePrintJobs', () => {
  return jest.fn(() => <div />);
});

const mockResources = {
  entries: {
    records: [],
  },
};

const mockMutator = {
  printingJob: {
    GET: jest.fn(),
    reset: jest.fn(),
  },
};

const props = {
  resources: mockResources,
  mutator: mockMutator
};

const renderPatronNoticePrintJobsContainer = () => renderWithRouter(<PatronNoticePrintJobsContainer {...props} />);

describe('PatronNoticePrintJobsContainer', () => {
  it('renders without crashing', () => {
    const { container } = renderPatronNoticePrintJobsContainer();
    expect(container).toBeInTheDocument();
  });
});
