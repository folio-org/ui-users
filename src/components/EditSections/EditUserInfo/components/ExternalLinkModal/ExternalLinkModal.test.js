import {
  screen,
  render,
  fireEvent,
  waitFor,
} from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';

import { isAValidURL, isAValidImageUrl } from '../../../../util';

import '../../../../../../test/jest/__mock__';

import ExternalLinkModal from './ExternalLinkModal';

jest.unmock('@folio/stripes/components');

jest.mock('../../../../util');
jest.mock('@folio/stripes/components', () => ({
  ...jest.requireActual('@folio/stripes/components'),
  Modal: jest.fn(({ children, label, dismissible, footer, ...rest }) => {
    return (
      <div
        data-test={dismissible ? '' : ''}
        {...rest}
      >
        <h1>{label}</h1>
        {children}
        {footer}
      </div>
    );
  }),
}));

const renderExternalLinkModal = (props) => render(<ExternalLinkModal {...props} />);

describe('ExternalLinkModal', () => {
  const props = {
    onOpen: jest.fn(),
    onClose: jest.fn(),
    onSave: jest.fn(),
    profilePictureLink: 'profilePictureLink',
  };

  beforeEach(() => {
    isAValidURL.mockReset();
    isAValidImageUrl.mockReset();
    renderExternalLinkModal(props);
  });

  it('should have modal title - Update profile picture', () => {
    expect(screen.getByText('ui-users.information.profilePicture.externalLink.modal.updateProfilePicture')).toBeInTheDocument();
  });
  it('should display textfield', () => {
    expect(screen.getByText('ui-users.information.profilePicture.externalLink.modal.externalURL')).toBeInTheDocument();
  });
  it('should call onSave', async () => {
    isAValidImageUrl.mockImplementationOnce(() => true);
    const saveButton = screen.getByRole('button', { name: 'ui-users.save' });
    const inputElement = screen.getByLabelText('ui-users.information.profilePicture.externalLink.modal.externalURL');

    fireEvent.change(inputElement, { target: { value: 'https://upload.wikimedia.org/wikipedia/commons/e/e2/FOLIO_400x400.jpg' } });
    await userEvent.click(saveButton);

    expect(props.onSave).toHaveBeenCalled();
  });
  it('should show error text when url is invalid url', async () => {
    isAValidURL.mockImplementationOnce(() => false);
    const inputElement = screen.getByLabelText('ui-users.information.profilePicture.externalLink.modal.externalURL');

    fireEvent.change(inputElement, { target: { value: 'profile picture' } });
    fireEvent.blur(inputElement);

    await waitFor(() => expect(screen.getByText('ui-users.information.profilePicture.externalLink.modal.externalURL.invalidURLErrorMessage')).toBeInTheDocument());
  });
  it('should call onClose', async () => {
    const cancelButton = screen.getByRole('button', { name: 'stripes-core.button.cancel' });
    await userEvent.click(cancelButton);

    expect(props.onClose).toHaveBeenCalled();
  });
});
