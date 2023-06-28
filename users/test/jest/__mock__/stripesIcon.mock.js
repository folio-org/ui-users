import React from 'react';

jest.mock('@folio/stripes-components/lib/Icon', () => {
  return ({ icon, id }) => <span id={id ?? 'foo'}>Icon ({icon})</span>;
});
