import React from 'react';
import { render, screen } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';

import '__mock__';
import '__mock__/stripesSmartComponent.mock'
import '__mock__/stripesCore.mock';

import { StripesContext } from '@folio/stripes-core/src/StripesContext';
import userEvent from '@testing-library/user-event';
import BlockTemplates from './BlockTemplates';

const resources = {
  manualBlockTemplates: {
    records: [
      {
        id: '1',
        name: 'Template 1',
      },
      {
        id: '2',
        name: 'Template 2',
      }
    ],
  },
};

const mutator = {
  manualBlockTemplates: {
    POST: jest.fn(),
    PUT: jest.fn(),
    DELETE: jest.fn(),
  },
};

const stripes = {
  okapi: {
    tenant: 'test',
    token: 'test-token',
    url: 'http://localhost:3000',
  },
  store: {
    getState: () => ({ okapi: { token: 'test-token' } }),
    dispatch: () => {},
    subscribe: () => {},
  },
};

const history = createMemoryHistory();

describe('BlockTemplates', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should render BlockTemplates component', async () => {
    render(
      <StripesContext.Provider value={stripes}>
        <Router history={history}>
          <BlockTemplates
            resources={resources}
            mutator={mutator}
            intl={{ formatMessage: jest.fn() }}
          />
        </Router>
      </StripesContext.Provider>
    );
    userEvent.click(screen.getByText('actions'));
    expect(screen.getByText('actions')).toBeInTheDocument();
  });
});
