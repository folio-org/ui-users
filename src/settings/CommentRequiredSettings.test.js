import React from 'react';
import { screen } from '@testing-library/react';
import '__mock__/stripesCore.mock';
import renderWithRouter from 'helpers/renderWithRouter';

import userEvent from '@testing-library/user-event';

import CommentRequiredSettings from './CommentRequiredSettings';

jest.unmock('@folio/stripes/components');

const props = {
  mutator: {
    record: {
      update: jest.fn()
    },
    commentRequired: {
      POST: jest.fn(),
      PUT: jest.fn(),
      GET: jest.fn().mockResolvedValue([{ id: 1 }])
    }
  },
  resources: {
    commentRequired: {
      records: [{ paid: false,
        waived: false,
        refunded: false,
        transferredManually: true }],
      hasLoaded: true,

    }
  }
};

const renderCommentRequiredSettings = () => renderWithRouter(<CommentRequiredSettings {...props} />);
describe('CommentRequiredSettings', () => {
  it('renders', () => {
    renderCommentRequiredSettings();
    expect(screen.getByText('ui-users.comment.title')).toBeInTheDocument();
    const refunDropdown = screen.getAllByText('ui-users.comment.refunded');
    expect(refunDropdown).toHaveLength(2);
    userEvent.selectOptions(screen.getByRole('combobox', { name: 'ui-users.comment.transferred' }), 'ui-users.no');
    userEvent.click(screen.getByRole('button', { name: 'ui-users.comment.save' }));
    screen.debug();
    expect(screen.getByRole('button', { name: 'ui-users.comment.save' })).toBeInTheDocument();
  });
});
