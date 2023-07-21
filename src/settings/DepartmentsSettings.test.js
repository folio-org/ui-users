import React from 'react';

import { screen } from '@folio/jest-config-stripes/testing-library/react';
import { ControlledVocab } from '@folio/stripes/smart-components';

import '__mock__/stripesCore.mock';
import '__mock__/stripesSmartComponent.mock';
import '__mock__/intl.mock';

import renderWithRouter from 'helpers/renderWithRouter';
import { RECORD_SOURCE } from '../constants';
import DepartmentsSettings, { validate } from './DepartmentsSettings';

jest.unmock('@folio/stripes/components');
jest.unmock('@folio/stripes/util');

const renderDepartmentsSettings = (props) => renderWithRouter(<DepartmentsSettings {...props} />);

describe('Departments settings', () => {
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
    };
    renderDepartmentsSettings(props);

    expect(screen.getByTestId('controlled-vocab')).toBeTruthy();
  });

  describe('validates submissions correctly', () => {
    const items = [
      { name: 'A', code: 'a' },
      { name: 'B', code: 'b' },
      { name: 'C', code: 'c' },
    ];

    test('unique attributes', () => {
      const res = validate({ name: 'A', code: 'a' }, 0, items);
      expect(res).toEqual({});
    });

    test('matching name', () => {
      const res = validate({ name: 'A', code: 'X' }, 1, items);
      expect(res).toMatchObject({ name: { props: { id: expect.stringContaining('departments.name.error') } } });
    });

    test('matching code', () => {
      const res = validate({ name: 'x', code: 'c' }, 1, items);
      expect(res).toMatchObject({ code: { props: { id: expect.stringContaining('departments.code.error') } } });
    });

    test('missing code', () => {
      const res = validate({ name: 'x' }, 0, items);
      expect(res).toMatchObject({ code: { props: { id: expect.stringContaining('departments.code.required') } } });
    });
  });

  describe('Action suppression', () => {
    it('should suppress \'edit\' and \'delete\' actions for item with the \'consortium\' source', () => {
      const department = {
        id: '82db1a06-6e4a-40a4-ac94-770e222e09ac',
        name: 'Shared department',
        code: 'tst',
        usageNumber: 0,
        source: RECORD_SOURCE.CONSORTIUM,
        metadata: {
          createdDate: '2023-07-11T10:50:42.623+00:00',
          createdByUserId: 'ff96b580-4206-4957-8b5d-7bdbc3d192f9',
          updatedDate: '2023-07-11T10:50:42.623+00:00',
          updatedByUserId: 'ff96b580-4206-4957-8b5d-7bdbc3d192f9'
        }
      };

      renderDepartmentsSettings({
        stripes: { connect: jest.fn(c => c) }
      });

      const { actionSuppressor } = ControlledVocab.mock.calls[0][0];

      expect(actionSuppressor.edit(department)).toBeTruthy();
      expect(actionSuppressor.delete(department)).toBeTruthy();
    });
  });
});
