import { render, screen } from '@folio/jest-config-stripes/testing-library/react';

import { USER_TYPES } from '../../../../../constants';
import ChangeUserTypeModal from './ChangeUserTypeModal';

describe('ChangeUserTypeModal', () => {
  it('should render component', () => {
    const onChange = jest.fn();
    render(<ChangeUserTypeModal
      open
      onChange={onChange}
      initialUserType={USER_TYPES.STAFF}
    />);

    expect(screen.getByTestId('ui-users.information.change.userType.modal.label')).toBeInTheDocument();
  });
});
