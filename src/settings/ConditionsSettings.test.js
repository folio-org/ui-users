import React from 'react';
import { act } from '@folio/jest-config-stripes/testing-library/react';

import '__mock__/stripesCore.mock';
import '__mock__/stripesSmartComponent.mock';
import '__mock__/intl.mock';

import renderWithRouter from 'helpers/renderWithRouter';
import ConditionsSettings from './ConditionsSettings';

jest.mock('@folio/stripes/core');
jest.mock('@folio/stripes/smart-components');

const renderConditionsSettings = (props) => renderWithRouter(<ConditionsSettings {...props} />);

describe('ConditionsSettings', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('returns an empty array when there are no patronBlockConditions', async () => {
    const nullProps = {
      resources: {
        patronBlockConditions: {
          records: [],
        },
      },
      mutator: {
        patronBlockConditions: {
          GET: jest.fn(),
        },
      },
    };
    await act(async () => {
      const { container } = renderConditionsSettings(nullProps);
      expect(container.firstChild).toBeNull();
    });
  });
  describe('ConditionsSettings with patronBlockConditions', () => {
    it('returns an array of routes when there are patronBlockConditions', async () => {
      const nonNullProps = {
        resources: {
          patronBlockConditions: {
            records: [
              { id: '1', name: 'Condition 1' },
              { id: '2', name: 'Condition 2' },
            ],
          },
        },
        mutator: {
          patronBlockConditions: {
            GET: jest.fn(),
          },
        },
        match: { path: '/settings/users/setad' },
        location: { pathname: '/settings/users/setad' },
      };
      await act(async () => {
        const { getByRole, getByText } = renderConditionsSettings(nonNullProps);
        expect(getByRole('region')).not.toBeNull();
        expect(getByText(/ui-users.settings.conditions/i)).toBeInTheDocument();
        expect(getByText(/Condition 1/i)).toBeInTheDocument();
        expect(getByText(/Condition 2/i)).toBeInTheDocument();
      });
    });
  });
});
