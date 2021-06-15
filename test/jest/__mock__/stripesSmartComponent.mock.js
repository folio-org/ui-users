import React from 'react';

jest.mock('@folio/stripes/smart-components', () => ({
  ...jest.requireActual('@folio/stripes/smart-components'),
  LocationLookup: () => <div>LocationLookup</div>,
  NotesSmartAccordion: () => <div>NotesSmartAccordion</div>,
  ViewMetaData: () => <div>ViewMetaData</div>,
  AddressEditList: () => <div>AddressEditList</div>,
}),
{ virtual: true });
