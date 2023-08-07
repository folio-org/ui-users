import React from 'react';
import { screen, waitFor } from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';
import renderWithRouter from 'helpers/renderWithRouter';
import CommentRequiredSettings from './CommentRequiredSettings';

jest.unmock('@folio/stripes/components');
const mockPUT = jest.fn();
const mockPOST = jest.fn();
const defaultProps = {
  mutator: {
    record: {
      update: jest.fn()
    },
    commentRequired: {
      POST: mockPOST,
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

const renderCommentRequiredSettings = (props) => renderWithRouter(<CommentRequiredSettings {...props} />);
describe('CommentRequiredSettings', () => {
  it('Component should render correctly', () => {
    renderCommentRequiredSettings(defaultProps);
    expect(screen.getByText('ui-users.comment.title')).toBeInTheDocument();
  });
  it('PUT function to called on clicking save button', async () => {
    renderCommentRequiredSettings(defaultProps);
    userEvent.selectOptions(screen.getByRole('combobox', { name: 'ui-users.comment.transferred' }), 'ui-users.no');
    userEvent.click(screen.getByRole('button', { name: 'ui-users.comment.save' }));
    await waitFor(() => {
      expect(mockPUT).toHaveBeenCalled();
    });
  });
  it('should render component properly when GET call do not respond with any records', () => {
    const alteredProps = {
      ...defaultProps,
      mutator: {
        ...defaultProps.mutator,
        commentRequired: {
          ...defaultProps.mutator.commentRequired,
          GET: jest.fn().mockResolvedValue([])
        }
      },
      resources: {
        ...defaultProps.resources,
        commentRequired: {
          ...defaultProps.resources.commentRequired,
          records: []
        }
      }
    };
    renderCommentRequiredSettings(alteredProps);
    expect(screen.getByText('ui-users.comment.title')).toBeInTheDocument();
  });
  it('should make POST call when length of records is 0', async () => {
    const alteredProps = {
      ...defaultProps,
      mutator: {
        ...defaultProps.mutator,
        commentRequired: {
          ...defaultProps.mutator.commentRequired,
          GET: jest.fn().mockResolvedValue([])
        }
      },
      resources: {
        ...defaultProps.resources,
        commentRequired: {
          ...defaultProps.resources.commentRequired,
          records: []
        }
      }
    };
    renderCommentRequiredSettings(alteredProps);
    await waitFor(() => {
      expect(mockPOST).toHaveBeenCalled();
    });
  });
});
