import { render, screen } from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';

import { USER_TYPES } from '../../../../../constants';
import ChangeUserTypeModal from './ChangeUserTypeModal';

describe('ChangeUserTypeModal', () => {
  it('should render component', async () => {
    const onChange = jest.fn();
    render(<ChangeUserTypeModal
      open
      onChange={onChange}
      initialUserType={USER_TYPES.STAFF}
    />);

    expect(screen.getByText('ui-users.information.change.userType.modal.label')).toBeInTheDocument();

    const cancelButton = screen.getByText('ui-users.cancel');

    await userEvent.click(cancelButton);
    expect(onChange).toHaveBeenCalled();
  });
});
