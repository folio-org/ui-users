import React, { useEffect } from 'react';

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PropTypes from 'prop-types';

import renderWithRouter from 'helpers/renderWithRouter';
import Limits from './Limits';

import '__mock__/stripesCore.mock';

jest.unmock('@folio/stripes/components');
jest.unmock('@folio/stripes/smart-components');


const LimitsFormMock = ({ onSubmit }) => {
  const obj = {
    blockBorrowing: false,
    blockRenewals: false,
    blockRequests: false,
    id: '72b67965-5b73-4840-bc0b-be8f3f6e047e',
    message: '',
    name: 'Maximum number of lost items',
    valueType: 'Integer'
  };

  const value = {
    '3d7c52dc-c732-4223-8bf8-e5917801386f': '29'
  };

  useEffect(() => {
  });

  return (
    <div>
      <div>Mock Limits Form</div>
      <button type="button" data-testid="close-dialog" onClick={() => onSubmit(obj)}>save</button>
      <button type="button" data-testid="close-dialog" onClick={() => onSubmit(value)}>update</button>
    </div>);
};

LimitsFormMock.propTypes = {
  onSubmit: PropTypes.func,
};

jest.mock('./LimitsForm', () => LimitsFormMock);

const resources = {
  patronBlockLimitId: {},
  patronBlockLimits: {
    records: []
  }
};

const patronBlockConditions = [
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
];
const mockPost = jest.fn();
const mockPut = jest.fn();

const mutator = {
  patronBlockLimits: {
    DELETE: jest.fn().mockReturnValue(Promise.resolve()),
    POST: mockPost,
    PUT: mockPut,
    cancel: jest.fn(),
    reset: jest.fn(),
  },
  patronBlockLimitId: {
    update: jest.fn(),
    replace: jest.fn(),
  },
};

const propData = {
  patronGroup: 'graduate',
  patronGroupId: 'ad0bc554-d5bc-463c-85d1-5562127ae91b',
  patronBlockConditions,
  patronBlockLimits: [
    {
      conditionId: '3d7c52dc-c732-4223-8bf8-e5917801386f',
      id: '9f4f283f-bcb7-47db-92c7-cabdf9280695',
      patronGroupId: 'bdc2b6d4-5ceb-4a12-ab46-249b9a68473e',
      value: 2
    },
    {
      conditionId: '3d7c52dc-c732-4223-8bf8-e5917801386f',
      id: '104f1a4e-03e5-4982-8e7f-d35eac6e74ee',
      patronGroupId: 'ad0bc554-d5bc-463c-85d1-5562127ae91b',
      value: 2
    }
  ],
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


const renderLimits = async (props) => renderWithRouter(<Limits {...props} />);

describe('Limits', () => {
  beforeEach(async () => {
    await waitFor(() => renderLimits(propData));
  });
  it('component must be rendered', async () => {
    expect(screen.getByText('Mock Limits Form')).toBeInTheDocument();
  });
  it('Save limit conditions', async () => {
    userEvent.click(screen.getByText('save'));
    expect(mockPost).toHaveBeenCalled();
  });
  it('Update limit conditions', async () => {
    userEvent.click(screen.getByText('update'));
    expect(mockPut).toHaveBeenCalled();
  });
});
