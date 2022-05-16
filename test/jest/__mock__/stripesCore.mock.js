import React from 'react';

jest.mock('@folio/stripes/core', () => {
  const STRIPES = {
    actionNames: [],
    bindings: {},
    clone: jest.fn(),
    connect: (Component) => Component,
    config: {
      logCategories: '',
      logPrefix: '',
      logTimestamp: true,
      showPerms: true,
      showHomeLink: true,
      listInvisiblePerms: true,
      disableAuth: false,
      hasAllPerms: false,
    },
    currency: 'USD',
    discovery: {
      interfaces: {},
      isFinished: true,
      modules: {},
      okapi: {},
    },
    epics: {
      add: jest.fn(),
      middleware: jest.fn(),
    },
    hasInterface: () => true,
    hasPerm: jest.fn().mockReturnValue(true),
    icons: {},
    locale: 'en-US',
    logger: {
      log: () => {},
    },
    metadata: {},
    okapi: {
      authFailure: false,
      okapiReady: true,
      tenant: 'diku',
      token: 'c0ffee',
      translations: {
        'stripes-components.Datepicker.calendar': 'calendar',
        'stripes-components.Datepicker.calendarDaysList': 'calendar days list.',
        'stripes-core.button.cancel': [{ type: 0, value: 'Cancel' }],
        'ui-users.permission.modal.list.pane.header': 'Permissions',
        'ui-users.permission.modal.list.pane.header.array': [{ type: 0, value: 'Permissions' }],
        default: false,
      },
      url: 'https://folio-testing-okapi.dev.folio.org',
      withoutOkapi: false,
    },
    plugins: {},
    setBindings: jest.fn(),
    setCurrency: jest.fn(),
    setLocale: jest.fn(),
    setSinglePlugin: jest.fn(),
    setTimezone: jest.fn(),
    setToken: jest.fn(),
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
        addresses: [],
        firstName: 'Testy',
        lastName: 'McTesterson',
        email: 'test@folio.org',
        id: 'b1add99d-530b-5912-94f3-4091b4d87e2c',
        username: 'diku_admin',
      },
    },
    withOkapi: true,
  };

  // eslint-disable-next-line react/prop-types
  const stripesConnect = Component => ({ mutator, resources, stripes, ...rest }) => {
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
  };

  return {
    ...jest.requireActual('@folio/stripes/core'),
    AppIcon: jest.fn(({ ariaLabel }) => <span>{ariaLabel}</span>),
    TitleManager: jest.fn(({ children, ...rest }) => (
      <span {...rest}>{children}</span>
    )),
    IfInterface: jest.fn(({ name, children }) => {
      return name === 'interface' || name === 'service-points-users' ? children : null;
    }),
    IfPermission: jest.fn(({ perm, children }) => {
      if (perm === 'permission') {
        return children;
      } else if (perm.startsWith('ui-users')) {
        return children;
      } else if (perm.startsWith('perms')) {
        return children;
      } else if (perm.startsWith('inventory-storage')) {
        return children;
      } else {
        return null;
      }
    }),
    Pluggable: jest.fn(({ children }) => [children]),
    connect: stripesConnect,
    stripesConnect,
    useStripes: () => STRIPES,
    withStripes:
      // eslint-disable-next-line react/prop-types
      (Component) => ({ stripes, ...rest }) => {
        const fakeStripes = stripes || STRIPES;
        return <Component {...rest} stripes={fakeStripes} />;
      },
    withRouter:
      // eslint-disable-next-line react/prop-types
      (Component) => ({ stripes, ...rest }) => {
        const fakeStripes = stripes || STRIPES;
        return <Component {...rest} stripes={fakeStripes} />;
      },
  };
});
