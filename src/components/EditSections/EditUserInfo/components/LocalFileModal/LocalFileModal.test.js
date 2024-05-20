import { screen, render } from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';

import LocalFileModal from './LocalFileModal';

jest.mock('./components/Slider', () => {
  return jest.fn((props) => (
    <label
      htmlFor="input"
    >
      {props.label}
      <input id="input" value={props.value} />
    </label>
  ));
});

describe('LocalFileModal', () => {
  const props = {
    open: true,
    onClose: jest.fn(),
    imageSrc: 'imageSrc',
    rotation: 0,
    setRotation: jest.fn(),
    onSave: jest.fn(),
  };

  beforeEach(() => {
    render(
      <LocalFileModal {...props} />
    );
  });

  it('should render local file modal', () => {
    expect(screen.getByText('ui-users.information.profilePicture.localFile.modal.previewAndEdit')).toBeInTheDocument();
  });
  it('should display zoom slider ', () => {
    expect(screen.getByText('zoom')).toBeInTheDocument();
  });
  it('should display rotate slider ', () => {
    expect(screen.getByText('rotate')).toBeInTheDocument();
  });
  it('should call onSave', async () => {
    const saveButton = screen.getByRole('button', { name: /saveAndClose/ });
    await userEvent.click(saveButton);

    expect(props.setRotation).toHaveBeenCalled();
  });
  it('should close modal on clicking cancel button', async () => {
    const cancelButton = screen.getByRole('button', { name: 'stripes-core.button.cancel' });
    await userEvent.click(cancelButton);

    expect(props.onClose).toHaveBeenCalled();
  });
});

