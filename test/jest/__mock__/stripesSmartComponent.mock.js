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
    ChangeDueDateDialog: (props) => <div data-testid="change-duedate-dialog">ChangeDueDateDialog</div>,
    ControlledVocab: jest.fn(({ validate }) => <div data-testid="controlled-vocab">ControlledVocab</div>),
    EditCustomFieldsRecord: jest.fn(() => <div>EditCustomFieldsRecord accordion</div>),
    DueDatePicker: () => <div data-testid="due-date-picker">DueDatePicker</div>,
    LocationLookup: () => <div>LocationLookup</div>,
    NotePopupModal: () => <div>NotePopupModal</div>,
    NotesSmartAccordion: () => <div>NotesSmartAccordion</div>,
    ViewCustomFieldsRecord: () => <div>ViewCustomFieldsRecord</div>,
    ViewMetaData: () => <div>ViewMetaData</div>,
    ProfilePicture: () => <div>ProfilePicture</div>,
    EntryManager: (props) => {
      // console.log(props);
      const actions = () => {
        const data = {
          childOf: '',
          grantedTo: '',
          dummy: '',
          deprecated: '',
          subPermissions: [{ permissionName: 'circ-observer-sub' }]
        };
        if(props.onBeforeSave){
          props.onBeforeSave(data);
        }
        const values = { };
        props.validate(values);
      };
      const emptyActions = () => {
        const data = { };
        if(props.onBeforeSave){
        props.onBeforeSave(data);
      }
        const values = {
          name: 'test1'
        };
        props.validate(values);
      };
      const component =
        <div data-testid="entry-manager">
          <div>
            { props.entryList.map((data, index) => <div key={index}>{data.permissionName}</div>)}
            <button data-testid="entry-manager-actions" onClick={actions} type="button">actions</button>
            <button data-testid="entry-manager-emptyActions" onClick={emptyActions} type="submit">emptyActions</button>
          </div>
        </div>;
      return component;
    },
    useCustomFieldsQuery: jest.fn(() => ({
      customFields: [],
      isLoadingCustomFields: false,
      isCustomFieldsError: false,
      refetchCustomFields: jest.fn(),
    })),
  };
});
