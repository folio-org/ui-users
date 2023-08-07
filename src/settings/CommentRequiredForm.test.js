import React from 'react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';

import { screen } from '@folio/jest-config-stripes/testing-library/react';
import { Form } from 'react-final-form';

import renderWithRouter from 'helpers/renderWithRouter';
import CommentRequiredForm from './CommentRequiredForm';
import '__mock__/stripesSmartComponent.mock';

jest.unmock('@folio/stripes/components');

const handleSubmitMock = jest.fn();
const onSubmitMock = jest.fn();

const arrayMutators = {
  pop: jest.fn(),
  push: jest.fn(),
};

const renderCommentRequiredForm = (props) => {
  const component = () => (
    <CommentRequiredForm {...props} />
  );
  renderWithRouter(<Form
    id="form-user"
    mutators={{
      ...arrayMutators
    }}
    initialValues={{ }}
    onSubmit={onSubmitMock}
    render={component}
  />);
};

describe('CommentRequiredForm', () => {
  it('if it renders', () => {
    const props = {
      handleSubmit: handleSubmitMock,
      onSubmit: onSubmitMock,
      pristine: false,
      submitting: false,
      intl: {
        formatMessage: ({ id }) => <span>{id}</span>
      }
    };
    renderCommentRequiredForm(props);
    expect(screen.getByText('ui-users.comment.title'));
  });
  it('Checking if waive functionality works', () => {
    const props = {
      handleSubmit: handleSubmitMock,
      onSubmit: onSubmitMock,
      pristine: false,
      submitting: false,
      intl: {
        formatMessage: ({ id }) => <span>{id}</span>
      }
    };
    renderCommentRequiredForm(props);
    userEvent.click(document.querySelector('[name="waived"]'));
    userEvent.click(document.querySelector('[id="clickable-save-comment"]'));
    expect(screen.getAllByText('ui-users.comment.waived')[0]).toBeInTheDocument();
  });

  describe('when viewOnly prop is true', () => {
    it('should render comment required component form', () => {
      const props = {
        handleSubmit: handleSubmitMock,
        onSubmit: onSubmitMock,
        pristine: false,
        submitting: false,
        intl: {
          formatMessage: ({ id }) => <span>{id}</span>
        },
        viewOnly: true
      };
      renderCommentRequiredForm(props);
      expect(screen.getByText('ui-users.comment.title'));
    });

    it('should have all settings as disabled', () => {
      const props = {
        handleSubmit: handleSubmitMock,
        onSubmit: onSubmitMock,
        pristine: false,
        submitting: false,
        intl: {
          formatMessage: ({ id }) => <span>{id}</span>
        },
        viewOnly: true
      };
      renderCommentRequiredForm(props);

      const settings = screen.getAllByRole('combobox');

      settings.forEach(setting => {
        expect(setting).toBeDisabled();
      });
    });
  });
});
