
import { screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import '__mock__/stripesCore.mock';

import renderWithRouter from 'helpers/renderWithRouter';
import CreateResetPasswordControl from './CreateResetPasswordControl';

jest.unmock('@folio/stripes/components');
jest.unmock('@folio/stripes/smart-components');

const renderCreateResetPasswordControl = (props) => renderWithRouter(<CreateResetPasswordControl {...props} />);

const propData = (postMock) => {
  return {
    email: 'testemail@email.com',
    name: 'sample',
    userId: 'testUserId123',
    mutator: {
      resetPassword: {
        POST: postMock,
      }
    },
  };
};

describe('CreateResetPasswordControl component', () => {
  afterEach(cleanup);
  it('If CreateResetPasswordControl Renders', () => {
    const mockFunc = jest.fn(() => new Promise((resolve, _) => {
      resolve({ ok: true, link: 'bl-users/password-reset/link' });
    }));
    renderCreateResetPasswordControl(propData(mockFunc));
    expect(screen.getByText('ui-users.extended.sendResetPassword')).toBeInTheDocument();
  });
  it('If reset password renders on click', async () => {
    const mockFunc = jest.fn(() => new Promise((resolve, _) => {
      resolve({ ok: true, link: 'bl-users/password-reset/link' });
    }));
    await waitFor(() => renderCreateResetPasswordControl(propData(mockFunc)));
    await userEvent.click(screen.getByText('ui-users.extended.sendResetPassword'));
    expect(screen.getByText('testemail@email.com')).toBeInTheDocument();
  });
  it('If it redirects after POST fails', async () => {
    const mockFunc = jest.fn(() => new Promise((_, reject) => {
      const error = 'Something Went Wrong';
      reject(error);
    }));
    await waitFor(() => renderCreateResetPasswordControl(propData(mockFunc)));
    await userEvent.click(screen.getByText('ui-users.extended.sendResetPassword'));
    await screen.debug();
  });
});
