import React from 'react';
import { screen, waitFor } from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';
import renderWithRouter from 'helpers/renderWithRouter';
import CommentRequiredSettings from './CommentRequiredSettings';

jest.unmock('@folio/stripes/components');
const mockPUT = jest.fn();
const props = {
  mutator: {
    record: {
      update: jest.fn()
    },
    commentRequired: {
      POST: jest.fn(),
      PUT: mockPUT,
      GET: jest.fn().mockResolvedValue([{ id: 1 }])
    }
  },
  resources: {
    commentRequired: {
      records: [
        {
          paid: false,
          waived: false,
          refunded: false,
          transferredManually: true
        }
      ],
      hasLoaded: true,
    }
  },
  stripes: {
    hasPerm: jest.fn(() => true),
  }
};

const renderCommentRequiredSettings = () => renderWithRouter(<CommentRequiredSettings {...props} />);
describe('CommentRequiredSettings', () => {
  it('Component should render correctly', () => {
    renderCommentRequiredSettings();
    expect(screen.getByText('ui-users.comment.title')).toBeInTheDocument();
  });
  it('PUT function to called on clicking save button', async () => {
    renderCommentRequiredSettings();
    userEvent.selectOptions(screen.getByRole('combobox', { name: 'ui-users.comment.transferred' }), 'ui-users.no');
    userEvent.click(screen.getByRole('button', { name: 'ui-users.comment.save' }));
    await waitFor(() => {
      expect(mockPUT).toHaveBeenCalled();
    });
  });
});
