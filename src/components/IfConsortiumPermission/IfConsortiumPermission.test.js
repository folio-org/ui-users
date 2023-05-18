import { useConsortiumPermissions } from '../../hooks';

import IfConsortiumPermission from './IfConsortiumPermission';

jest.mock('../../hooks', () => ({
  useConsortiumPermissions: jest.fn(),
}));

describe('IfConsortiumPermission', () => {
  it('should return null when permission not found', () => {
    const perm = 'consortia.view';
    const children = 'child';

    useConsortiumPermissions.mockClear().mockReturnValue({ permissions: {} });

    expect(IfConsortiumPermission({ perm, children })).toBeNull();
  });

  it('should return children when permission found', () => {
    const perm = 'consortia.view';
    const children = 'child';

    useConsortiumPermissions.mockClear().mockReturnValue({ permissions: { [perm]: true } });

    expect(IfConsortiumPermission({ perm, children })).toBe(children);
  });
});
