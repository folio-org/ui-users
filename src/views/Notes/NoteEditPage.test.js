import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { NoteEditPage } from '@folio/stripes/smart-components';
import NoteEditRoute from './NoteEditPage';
import { retrieveNoteReferredEntityDataFromLocationState } from '../../components/util';

jest.mock('@folio/stripes/smart-components', () => ({
  ...jest.requireActual('@folio/stripes/smart-components'),
  NoteEditPage: jest.fn(() => (<div>NoteEditPage</div>)),
}));

const history = {
  'length': 6,
  'action': 'PUSH',
  location: {
    hash: '',
    key: '9pb09t',
    pathname: '/users/notes/4e247def-44d8-4780-92d0-e7656b8d3039/edit',
    search: '',
    state: {
      entityId: '2205005b-ca51-4a04-87fd-938eefa8f6de',
      entityName: 'rick, psych',
      entityType: 'user',
      referredRecordData: {}
    }
  },
  'createHref': () => {},
  'push': () => {},
  'replace': () => {},
  'go': () => {},
  'goBack': () => {},
  'goForward': () => {},
  'block': () => {},
  'listen': () => {},
};

const location = history.location;

const match = {
  isExact: true,
  params: {
    id: '4e247def-44d8-4780-92d0-e7656b8d3039',
  },
  path: '/users/notes/:id/edit',
  url: '/users/notes/4e247def-44d8-4780-92d0-e7656b8d3039/edit'
};

const renderNoteEditRoute = (props) => render(
  <MemoryRouter>
    <NoteEditRoute {...props} />
  </MemoryRouter>
);

describe('render NoteEditPage', () => {
  it('should pass well defined referredEntityData prop to NoteEditPage when location.state is defined', () => {
    const props = {
      history,
      location,
      match
    };
    renderNoteEditRoute(props);
    expect(NoteEditPage.mock.calls[0][0].referredEntityData).toEqual(retrieveNoteReferredEntityDataFromLocationState(props.location.state));
  });
  it('should pass well defined referredEntityData prop to NoteEditPage when location.state is defined', () => {
    const props = {
      history,
      location,
      match
    };
    renderNoteEditRoute(props);
    expect(NoteEditPage.mock.calls[0][0].noteId).toEqual(match.params.id);
  });
  it('should render Note Edit Page', async () => {
    const { getByText } = renderNoteEditRoute({
      history,
      location,
      match
    });

    expect(getByText('NoteEditPage')).toBeInTheDocument();
  });
});
