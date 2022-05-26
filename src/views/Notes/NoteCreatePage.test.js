import { createMemoryHistory } from 'history';

import renderWithRouter from 'helpers/renderWithRouter';

import NoteCreatePage from './NoteCreatePage';

const history = createMemoryHistory();
history.goBack = jest.fn();

const props = {
  history,
  location : history.location,
};

const renderNoteCreatePage = () => renderWithRouter(
  <div>
    <NoteCreatePage {...props} />
    Note Create Page
  </div>
);

describe('Note Create Page', () => {
  it('should render Note Create Page', async () => {
    const { getByText } = renderNoteCreatePage();

    expect(getByText('Note Create Page')).toBeInTheDocument();
  });
});
