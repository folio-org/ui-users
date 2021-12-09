import React from 'react';

import { screen } from '@testing-library/react';

import '__mock__/stripesCore.mock';
import '__mock__/stripesSmartComponent.mock';
import '__mock__/intl.mock';

import renderWithRouter from 'helpers/renderWithRouter';
import DepartmentsSettings, { validate } from './DepartmentsSettings';

jest.unmock('@folio/stripes/components');

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
});
