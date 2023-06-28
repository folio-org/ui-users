import { screen, cleanup } from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';

import renderWithRouter from 'helpers/renderWithRouter';
import CommentModal from './CommentModal';

jest.unmock('@folio/stripes/components');
jest.unmock('@folio/stripes/smart-components');

const renderCommentModal = (props) => renderWithRouter(<CommentModal {...props} />);

const MockFunc = jest.fn();


const propData = {
  form: { reset: MockFunc },
  pristine: false,
  submitting: false,
  onClose: MockFunc,
  handleSubmit: MockFunc,
  open: true,
  invalid: false,
  intl: { formatMessage : jest.fn() },
  onSubmit: jest.fn(),
};


describe('Comment Modal component', () => {
  beforeEach(() => {
    renderCommentModal(propData);
  });

  afterEach(cleanup);

  it('Check if modal Renders', () => {
    expect(screen.getByText('ui-users.accounts.comment.field.feeFineComment')).toBeInTheDocument();
  });

  it('Onclose modal check', () => {
    userEvent.click(screen.getByText('ui-users.accounts.comment.field.cancel'));
    expect(MockFunc).toHaveBeenCalled();
  });

  it('Comment check', () => {
    userEvent.type(document.querySelector('[name="comment"]'), 'TestComment');
    expect(screen.getByText('TestComment')).toBeInTheDocument();
  });

  it('OnSubmit modal check', async () => {
    userEvent.type(document.querySelector('[name="comment"]'), 'New Comment');
    userEvent.click(screen.getByText('ui-users.accounts.comment.field.save'));
    expect(MockFunc).toHaveBeenCalled();
  });
});
