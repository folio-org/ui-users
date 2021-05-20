import React from 'react';
import { act, render, screen } from '@testing-library/react';

import '../../../test/jest/__mock__';
import CheckDeleteUserModal from './CheckDeleteUserModal';

const onCloseModal = jest.fn();
const username = 'rick, psych';

const renderCheckDeleteUserModal = () => {
  return act(() => {
    render(
      <CheckDeleteUserModal
        onCloseModal={onCloseModal}
        open
        username={username}
      />
    );
  });
};

describe('CheckDeleteUserModal', () => {
  describe('render CheckDeleteUserModal', () => {
    beforeEach(() => {
      renderCheckDeleteUserModal();
    });
    test('modal is rendered', async () => {
      expect(document.querySelector('#delete-user-modal')).toBeInTheDocument();
    });
    // it('should display name', () => {
    //   expect(screen.getByLabelText('Are you sure you want to delete this user rick, psych?')).toBeInTheDocument();
    // });
  });
});
