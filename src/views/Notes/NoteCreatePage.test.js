import { render } from '@testing-library/react';

import NoteCreateRoute from './NoteCreatePage';

jest.mock('@folio/stripes/smart-components', () => ({
  ...jest.requireActual('@folio/stripes/smart-components'),
  NoteCreatePage: jest.fn(() => (<div>NoteCreatePage</div>)),
}));

const history = {
  location: {
    hash: '',
    key: '9pb09t',
    pathname: '/users/notes/new',
    search: '',
    state: {
      entityId: '2205005b-ca51-4a04-87fd-938eefa8f6de',
      entityName: 'rick, psych',
      entityType: 'user',
      referredRecordData: {}
    }
  }
};

const location = history.location;

const renderNoteCreateRoute = (props = {
  history,
  location
}) => render(
  <NoteCreateRoute {...props} />
);

describe('Note Create Page', () => {
  it('should render Note Create Page', async () => {
    const { getByText } = renderNoteCreateRoute();

    expect(getByText('NoteCreatePage')).toBeInTheDocument();
  });
});
