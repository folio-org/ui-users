import { screen, render } from '@folio/jest-config-stripes/testing-library/react';

import DeleteProfilePictureModal from './DeleteProfilePictureModal';

jest.unmock('react-intl');

jest.mock('react-intl', () => ({
  FormattedMessage: jest.fn(({ id, values }) => {
    if (values) {
      const valueStr = Object.values(values).join(',');
      return id + ' ' + valueStr;
    }

    return id;
  }),
}));

describe('DeleteProfilePictureModal', () => {
  const props = {
    open: true,
    onClose: jest.fn(),
    onConfirm: jest.fn(),
    personal: {
      lastName: 'psych',
      firstName: 'rick',
    },
  };
  beforeEach(() => {
    render(<DeleteProfilePictureModal {...props} />);
  });

  it('should render confirmation modal', () => {
    expect(screen.getByText('ui-users.information.profilePicture.delete.modal.heading')).toBeInTheDocument();
  });

  it('should render confirmation modal message', () => {
    const { lastName, firstName } = props.personal;
    expect(screen.getByText(`ui-users.information.profilePicture.delete.modal.message ${lastName},${firstName}`)).toBeInTheDocument();
  });
});
