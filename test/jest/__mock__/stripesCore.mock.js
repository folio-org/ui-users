import React from 'react';

jest.mock('@folio/stripes/core', () => {
  const STRIPES = {
    connect: (Component) => Component,
    config: {},
    currency: 'USD',
    hasInterface: () => true,
    hasPerm: jest.fn().mockReturnValue(true),
    locale: 'en-US',
    logger: {
      log: () => {},
    },
    okapi: {
      tenant: 'diku',
      url: 'https://folio-testing-okapi.dev.folio.org',
      translations: {
        'stripes-components.Datepicker.calendar': 'calendar',
        'stripes-components.Datepicker.calendarDaysList': 'calendar days list.',
        'stripes-core.button.cancel': [{ type: 0, value: 'Cancel' }],
        'ui-users.permission.modal.list.pane.header': 'Permissions',
        'ui-users.permission.modal.list.pane.header.array': [{ type: 0, value: 'Permissions' }],
        default: false,
      },
    },
    store: {
      getState: () => ({
        okapi: {
          token: 'abc',
        },
      }),
      dispatch: () => {},
      subscribe: () => {},
      replaceReducer: () => {},
    },
    timezone: 'UTC',
    user: {
      perms: {},
      user: {
        id: 'b1add99d-530b-5912-94f3-4091b4d87e2c',
        username: 'diku_admin',
      },
    },
    withOkapi: true,
  };
  return {
    ...jest.requireActual('@folio/stripes/core'),
    AppIcon: jest.fn(({ ariaLabel }) => <span>{ariaLabel}</span>),
    TitleManager: jest.fn(({ children, ...rest }) => (
      <span {...rest}>{children}</span>
    )),
    IfInterface: jest.fn(({ name, children }) => {
      return name === 'interface' ? children : null;
    }),
    IfPermission: jest.fn(({ perm, children }) => {
      if (perm === 'permission') {
        return children;
      } else if (perm.startsWith('ui-users')) {
        return children;
      } else if (perm.startsWith('perms')) {
        return children;
      } else {
        return null;
      }
    }),
    Pluggable: jest.fn(({ children }) => [children]),
    // eslint-disable-next-line react/prop-types
    stripesConnect: Component => ({ mutator, resources, stripes, ...rest }) => {
      const fakeMutator = mutator || Object.keys(Component.manifest || {}).reduce((acc, mutatorName) => {
        const returnValue = Component.manifest[mutatorName].records ? [] : {};

        acc[mutatorName] = {
          GET: jest.fn().mockReturnValue(Promise.resolve(returnValue)),
          PUT: jest.fn().mockReturnValue(Promise.resolve()),
          POST: jest.fn().mockReturnValue(Promise.resolve()),
          DELETE: jest.fn().mockReturnValue(Promise.resolve()),
          reset: jest.fn(),
          update: jest.fn(),
          replace: jest.fn(),
        };

        return acc;
      }, {});

      const fakeResources = resources || Object.keys(Component.manifest || {}).reduce((acc, resourceName) => {
        acc[resourceName] = {
          records: [],
        };

        return acc;
      }, {});

      const fakeStripes = stripes || STRIPES;

      return <Component {...rest} mutator={fakeMutator} resources={fakeResources} stripes={fakeStripes} />;
    },
    useStripes: () => STRIPES,
    withStripes:
      // eslint-disable-next-line react/prop-types
      (Component) => ({ stripes, ...rest }) => {
        const fakeStripes = stripes || STRIPES;
        return <Component {...rest} stripes={fakeStripes} />;
      },
  };
});
