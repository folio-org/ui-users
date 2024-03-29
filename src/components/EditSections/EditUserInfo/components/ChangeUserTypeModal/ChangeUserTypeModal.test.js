import { render, screen } from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';

import { USER_TYPES } from '../../../../../constants';
import ChangeUserTypeModal from './ChangeUserTypeModal';

describe('ChangeUserTypeModal', () => {
  it('should cancel modal confirmation', async () => {
    const onChange = jest.fn();
    render(<ChangeUserTypeModal
      open
      onChange={onChange}
      initialUserType={USER_TYPES.STAFF}
    />);

    expect(screen.getByText('ui-users.information.change.userType.modal.label')).toBeInTheDocument();

    const cancelButton = screen.getByText('ui-users.cancel');

    await userEvent.click(cancelButton);
    expect(onChange).toHaveBeenCalledWith(USER_TYPES.STAFF);
  });

  it('should confirm modal confirmation with `patron` user type', async () => {
    const onChange = jest.fn();
    const initialUserType = USER_TYPES.STAFF;

    render(<ChangeUserTypeModal
      open
      onChange={onChange}
      initialUserType={initialUserType}
    />);

    expect(screen.getByText('ui-users.information.change.userType.modal.label')).toBeInTheDocument();

    const cancelButton = screen.getByText('ui-users.information.change.userType.modal.confirm');

    await userEvent.click(cancelButton);
    expect(onChange).toHaveBeenCalledWith(USER_TYPES.PATRON);
  });
});
