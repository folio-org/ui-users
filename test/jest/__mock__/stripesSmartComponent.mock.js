import React from 'react';

jest.mock('@folio/stripes/smart-components', () => {
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
  ...jest.requireActual('@folio/stripes/smart-components'),
  Settings: Component => ({pages, ...props}) => {
    const fakePages  = pages || [];
    const fakeStripes =  STRIPES;
    const fakeAdditionalRoutes = {};
    const fakeMatch = {
      path: '/settings/users/limits',
      url: '/settings/users/limits',
      isExact: true,
    };
    const fakeSection = [{
      label: '',
      pages: props.pages || [],
    }];
    
    fakeSection.pages.map(page => ({
      page,
      component: page.component(),
    }));

    return <Component pages={fakePages} additionalRoutes={fakeAdditionalRoutes} stripes={fakeStripes} section={fakeSection} />;
  },
  LocationLookup: () => <div>LocationLookup</div>,
  NotesSmartAccordion: () => <div>NotesSmartAccordion</div>,
  ViewMetaData: (...props) => <div>ViewMetaData</div>,
  AddressEditList: () => <div>AddressEditList</div>,
  NotePopupModal: () => <div>NotePopupModal</div>,
  ViewCustomFieldsRecord: () => <div>ViewCustomFieldsRecord</div>,
}
});
