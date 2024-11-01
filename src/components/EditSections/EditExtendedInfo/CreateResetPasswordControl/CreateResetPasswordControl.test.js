
import { screen, waitFor, cleanup } from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';

import '__mock__/stripesCore.mock';

import renderWithRouter from 'helpers/renderWithRouter';
import CreateResetPasswordControl from './CreateResetPasswordControl';

jest.unmock('@folio/stripes/components');
jest.unmock('@folio/stripes/smart-components');

const renderCreateResetPasswordControl = (props) => renderWithRouter(<CreateResetPasswordControl {...props} />);

const resetPasswordPostMockFn = jest.fn(() => new Promise((resolve, _) => {
  resolve({ ok: true, link: 'bl-users/password-reset/link' });
}));

const keycloakUserGetMockFn = jest.fn(() => new Promise((resolve, _) => {
  resolve({ ok: true });
}));

const keycloakUserPostMockFn = jest.fn(() => new Promise((resolve, _) => {
  resolve({ ok: true });
}));

const propData = (resetPasswordPostMock, keycloakUserGetMock, keycloakUserPostMock, disabled = false) => {
  return {
    email: 'testemail@email.com',
    name: 'sample',
    userId: 'testUserId123',
    mutator: {
      keycloakUser: {
        GET: keycloakUserGetMock,
        POST: keycloakUserPostMock,
      },
      resetPassword: {
        POST: resetPasswordPostMock,
      }
    },
    disabled,
  };
};

describe('CreateResetPasswordControl component', () => {
  afterEach(cleanup);
  it('If CreateResetPasswordControl Renders', () => {
    renderCreateResetPasswordControl(
      propData(resetPasswordPostMockFn, keycloakUserGetMockFn, keycloakUserPostMockFn)
    );
    expect(screen.getByText('ui-users.extended.sendResetPassword')).toBeInTheDocument();
  });
  it('If reset password must be open with copy link', async () => {
    await waitFor(() => renderCreateResetPasswordControl(
      propData(resetPasswordPostMockFn, keycloakUserGetMockFn, keycloakUserPostMockFn)
    ));
    await waitFor(() => userEvent.click(screen.getByText('ui-users.extended.sendResetPassword')));
    await waitFor(() => expect(screen.getByText('ui-users.extended.copyLink')).toBeInTheDocument());
  });
  it('should link be disabled', () => {
    renderCreateResetPasswordControl(
      propData(resetPasswordPostMockFn, keycloakUserGetMockFn, keycloakUserPostMockFn, true)
    );
    expect(screen.getByText('ui-users.extended.sendResetPassword')).toBeDisabled();
  });
  /* Can be uncommented after the  createResetpasswordControl modal logic is reworked. Should add an assertion at the end after the results */
  // it('If it redirects after POST fails', async () => {
  //   const mockFunc = jest.fn(() => new Promise((_, reject) => {
  //     const error = 'Something Went Wrong';
  //     reject(error);
  //   }));
  //   await waitFor(() => renderCreateResetPasswordControl(propData(mockFunc)));
  //   await userEvent.click(screen.getByText('ui-users.extended.sendResetPassword'));
  //   await screen.debug();
  // });
});
