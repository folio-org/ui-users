import React from 'react';

/* eslint-disable */

jest.mock('@folio/stripes/smart-components', () => {
  // *****************************************************
  // The STRIPES mock props is not used as of now
  // in any smart components so have commented it out
  // for any future usage while mocking any smart component
  // *****************************************************
  //
  // const STRIPES = {
  //   connect: (Component) => Component,
  //   config: {},
  //   currency: 'USD',
  //   hasInterface: () => true,
  //   hasPerm: jest.fn().mockReturnValue(true),
  //   locale: 'en-US',
  //   logger: {
  //     log: () => {},
  //   },
  //   okapi: {
  //     tenant: 'diku',
  //     url: 'https://folio-testing-okapi.dev.folio.org',
  //   },
  //   store: {
  //     getState: () => ({
  //       okapi: {
  //         token: 'abc',
  //       },
  //     }),
  //     dispatch: () => {},
  //     subscribe: () => {},
  //     replaceReducer: () => {},
  //   },
  //   timezone: 'UTC',
  //   user: {
  //     perms: {},
  //     user: {
  //       id: 'b1add99d-530b-5912-94f3-4091b4d87e2c',
  //       username: 'diku_admin',
  //     },
  //   },
  //   withOkapi: true,
  // };
  return {
    ...jest.requireActual('@folio/stripes/smart-components'),
    AddressEditList: () => <div data-testid="address-edit-list">AddressEditList</div>,
    ControlledVocab: ({ validate }) => <div data-testid="controlled-vocab">ControlledVocab</div>,
    LocationLookup: () => <div>LocationLookup</div>,
    NotePopupModal: () => <div>NotePopupModal</div>,
    NotesSmartAccordion: () => <div>NotesSmartAccordion</div>,
    ViewCustomFieldsRecord: () => <div>ViewCustomFieldsRecord</div>,
    ViewMetaData: () => <div>ViewMetaData</div>,
  };
});
