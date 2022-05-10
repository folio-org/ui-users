import React from 'react';

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import renderWithRouter from 'helpers/renderWithRouter';
import Conditions from './Conditions';

import '__mock__/stripesCore.mock';

jest.unmock('@folio/stripes/components');
jest.unmock('@folio/stripes/smart-components');

const resources = {
  patronBlockCondition: {
    records: [
      {
        blockBorrowing: false,
        blockRenewals: false,
        blockRequests: false,
        id: '3d7c52dc-c732-4223-8bf8-e5917801386f',
        message: '',
        name: 'Maximum number of items charged out',
        valueType: 'Integer'
      },
      {
        blockBorrowing: false,
        blockRenewals: false,
        blockRequests: false,
        id: '72b67965-5b73-4840-bc0b-be8f3f6e047e',
        message: '',
        name: 'Maximum number of lost items',
        valueType: 'Integer'
      }
    ]
  }
};

const mockPut = jest.fn();

const mutator = {
  patronBlockCondition: {
    DELETE: jest.fn().mockReturnValue(Promise.resolve()),
    POST: jest.fn(),
    PUT: mockPut,
    cancel: jest.fn(),
    reset: jest.fn(),
  },
};

const propData = {
  stripes: {
    connect: (Component) => props => <Component {...props} resources={resources} mutator={mutator} />,
    hasPerm: jest.fn().mockResolvedValue(true),
  },
  id: '3d7c52dc-c732-4223-8bf8-e5917801386f',
  resources,
  mutator,
  okapi: {
    url: 'https://folio-snapshot-okapi.dev.folio.org',
    tenant: 'diku',
    okapiReady: true,
    authFailure: [],
    bindings: {},
  },
};


const renderConditions = async (props) => renderWithRouter(<Conditions {...props} />);

describe('Conditions', () => {
  beforeEach(async () => {
    await waitFor(() => renderConditions(propData));
  });
  it('component must be rendered', async () => {
    expect(screen.getByText('Maximum number of items charged out')).toBeInTheDocument();
  });
  it('handle Submit in conditions form', async () => {
    userEvent.type(document.querySelector('[data-test-block-message="true"]'), 'Testing');
    expect(screen.getByText('Testing')).toBeInTheDocument();
    userEvent.click(screen.getByText('stripes-core.button.save'));
    expect(mockPut).toHaveBeenCalledTimes(0);
  });
});
