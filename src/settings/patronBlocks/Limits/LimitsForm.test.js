import React from 'react';

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import renderWithRouter from 'helpers/renderWithRouter';
import LimitsForm from './LimitsForm';

import '__mock__/stripesCore.mock';

jest.unmock('@folio/stripes/components');
jest.unmock('@folio/stripes/smart-components');

const handleSubmitMock = jest.fn();
const getStateMock = jest.fn();



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
  },
  {
    blockBorrowing: false,
    blockRenewals: false,
    blockRequests: false,
    id: 'cf7a0d5f-a327-4ca1-aa9e-dc55ec006b8a',
    message: '',
    name: 'Maximum outstanding fee/fine balance',
    valueType: 'Integer'
  }
];

const propData = {
  patronGroup: 'graduate',
  patronGroupId: 'ad0bc554-d5bc-463c-85d1-5562127ae91b',
  initialValues: {
    '3d7c52dc-c732-4223-8bf8-e5917801386f': 29
  },
  pristine: false,
  submitting: false,
  patronBlockConditions,
  onSubmit: handleSubmitMock,
  form: {
    getState: getStateMock,
  },
  handleSubmit: handleSubmitMock,
};

const renderLimitsForm = async (props) => renderWithRouter(<LimitsForm {...props} />);

describe('Conditions Form Component', () => {
  beforeEach(async () => {
    await waitFor(() => renderLimitsForm(propData));
  });
  it('component must be rendered', async () => {
    expect(screen.getByText('Maximum number of items charged out')).toBeInTheDocument();
  });
  it('Editing/Adding items', async () => {
    userEvent.type(document.querySelector('[id="72b67965-5b73-4840-bc0b-be8f3f6e047e"]'), '1');
    expect(document.querySelector('[id="72b67965-5b73-4840-bc0b-be8f3f6e047e"]').value).toBe('1');
  });
  it('handle Submit in conditions form', async () => {
    userEvent.click(screen.getByText('stripes-core.button.save'));
    expect(handleSubmitMock).toHaveBeenCalledTimes(0);
  });
});
