import { fireEvent } from '@testing-library/react';
import { createMemoryHistory } from 'history';

import renderWithRouter from 'helpers/renderWithRouter';

import NoteViewPage from './NoteViewPage';

jest.mock('@folio/stripes/smart-components', () => ({
  NoteViewPage:
    ({
      navigateBack,
      onEdit,
    }) => (
      <>
        <button type="button" onClick={navigateBack} data-testid="navigateBack">
          back
        </button>
        <button type="button" onClick={onEdit} data-testid="onEdit">
          edit
        </button>
      </>
    )
}));

const history = createMemoryHistory();
history.push = jest.fn();

const props = {
  history,
  location : history.location,
  match: {
    params: {
      id: 'id'
    },
  }
};

const renderNoteViewPage = () => renderWithRouter(
  <div>
    <NoteViewPage {...props} />
    Note View Page
  </div>
);

describe('Note View Page', () => {
  it('should render Note View Page', async () => {
    const { getByText } = renderNoteViewPage();

    expect(getByText('Note View Page')).toBeDefined();
  });

  it('should render navigate back button', () => {
    const { getByTestId } = renderNoteViewPage();

    expect(getByTestId('navigateBack')).toBeInTheDocument();
  });

  it('should redirect to users page', () => {
    const { getByRole } = renderNoteViewPage();

    fireEvent.click(getByRole('button', { name: 'back' }));

    expect(history.push).toHaveBeenCalled();
  });

  it('should render edit button', () => {
    const { getByTestId } = renderNoteViewPage();

    expect(getByTestId('onEdit')).toBeInTheDocument();
  });

  it('should redirect to the edit page', () => {
    const { getByRole } = renderNoteViewPage();

    fireEvent.click(getByRole('button', { name: 'edit' }));

    expect(history.push).toHaveBeenCalled();
  });
});
