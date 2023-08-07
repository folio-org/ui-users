import React from 'react';

import { screen } from '@folio/jest-config-stripes/testing-library/react';
import { ControlledVocab } from '@folio/stripes/smart-components';

import '__mock__/stripesCore.mock';
import '__mock__/stripesSmartComponent.mock';
import '__mock__/intl.mock';

import renderWithRouter from 'helpers/renderWithRouter';
import { RECORD_SOURCE } from '../constants';
import PatronGroupsSettings from './PatronGroupsSettings';

jest.unmock('@folio/stripes/components');
jest.unmock('@folio/stripes/util');

const renderPatronGroupsSettings = (props) => renderWithRouter(<PatronGroupsSettings {...props} />);

describe('Patron group settings', () => {
  it('renders', () => {
    const props = {
      resources: {},
      match: { path: '/settings/users/departments' },
      location: { pathname: '/settings/users/departments' },
      mutators: {},
      okapi: {
        url: 'https://folio-testing-okapi.dev.folio.org',
        tenant: 'diku',
        okapiReady: true,
        authFailure: [],
        bindings: {},
      },
      stripes: {
        connect: jest.fn(c => c),
        hasPerm: jest.fn(() => true),
      }
    };
    renderPatronGroupsSettings(props);

    expect(screen.getByTestId('controlled-vocab')).toBeTruthy();
  });

  describe('Action supression', () => {
    it('should suppress \'edit\' and \'delete\' actions for item with the \'consortium\' source', () => {
      const patronGroup = {
        group: 'Patron group shared',
        desc: 'Description',
        id: 'f44d9100-7fe5-4a61-a436-a81a5007efb8',
        expirationOffsetInDays: 100,
        source: RECORD_SOURCE.CONSORTIUM,
        metadata: {
          createdDate: '2023-07-11T10:08:20.312+00:00',
          createdByUserId: 'ff96b580-4206-4957-8b5d-7bdbc3d192f9',
          updatedDate: '2023-07-11T10:08:20.312+00:00',
          updatedByUserId: 'ff96b580-4206-4957-8b5d-7bdbc3d192f9'
        }
      };

      renderPatronGroupsSettings({
        stripes: {
          connect: jest.fn(c => c),
          hasPerm: jest.fn(() => true),
        }
      });

      const { actionSuppressor } = ControlledVocab.mock.calls[0][0];

      expect(actionSuppressor.edit(patronGroup)).toBeTruthy();
      expect(actionSuppressor.delete(patronGroup)).toBeTruthy();
    });
  });
});
