import { render, screen } from '@folio/jest-config-stripes/testing-library/react';

import '__mock__/matchMedia.mock';
import '__mock__/reactFinalFormArrays.mock';
import '__mock__/reactFinalFormListeners.mock';
import '__mock__/intl.mock';

import { useCallout, useStripes } from '@folio/stripes/core';

import affiliations from 'fixtures/affiliations';
import {
  useUserAffiliations,
  useUserTenantPermissions,
} from '../../hooks';
import TenantsPermissionsAccordion from './TenantsPermissionsAccordion';

jest.unmock('@folio/stripes/components');
jest.mock('../../components/PermissionsAccordion/components/PermissionsModal', () => {
  return ({ open }) => (open ? <div>PermissionsModal</div> : null);
});
jest.mock('../../components/IfConsortium', () => jest.fn(({ children }) => <>{children}</>));
jest.mock('../../components/IfConsortiumPermission', () => jest.fn(({ children }) => <>{children}</>));
jest.mock('../../hooks', () => ({
  useUserAffiliations: jest.fn(),
  useUserTenantPermissions: jest.fn(),
}));

const defaultProps = {
  form: {
    getFieldState: () => ({
      value: [
        { 'name': 'foo' },
      ]
    }),
    getState: jest.fn(() => ({
      values: {},
    })),
    change: jest.fn(),
    registerField: jest.fn(),
  },
  initialValues: {
    id: 'userId',
    username: 'userName',
  },
};

const renderPermissionsAccordion = (props = {}) => render(
  <TenantsPermissionsAccordion
    {...defaultProps}
    {...props}
  />
);

const tenants = affiliations.map(({ tenantId, tenantName }) => ({ id: tenantId, name: tenantName }));

describe('TenantsPermissionsAccordion', () => {
  let mockUserAffHookOpts;
  let mockUserTenantPermsHookOpts;
  const sendCallout = jest.fn();

  beforeEach(() => {
    defaultProps.form.change.mockClear();
    sendCallout.mockClear();
    useStripes.mockClear().mockReturnValue({
      okapi: {
        tenant: 'tenantId',
      }
    });
    useCallout.mockClear().mockReturnValue({ sendCallout });
    useUserAffiliations.mockClear().mockImplementation(((_, options) => {
      mockUserAffHookOpts = options;

      return { affiliations };
    }));
    useUserTenantPermissions.mockClear().mockImplementation(((_, options) => {
      mockUserTenantPermsHookOpts = options;

      return { tenants };
    }));
  });

  it('should render permissions list and affiliation selection', async () => {
    renderPermissionsAccordion();

    expect(screen.getByText('FieldArray')).toBeInTheDocument();
    expect(screen.getByText('stripes-components.selection.controlLabel')).toBeInTheDocument();
  });

  it.skip('should set permissions values for selected tenant in the form', async () => {
    renderPermissionsAccordion();

    mockUserTenantPermsHookOpts.onSuccess({ permissionNames: ['user.item.get'] });

    expect(defaultProps.form.registerField).toHaveBeenCalled();
  });

  it('should handle errors when affiliations or permissions loading is failed', async () => {
    renderPermissionsAccordion();

    mockUserAffHookOpts.onError();
    mockUserTenantPermsHookOpts.onError();

    expect(sendCallout).toHaveBeenCalledTimes(2);
  });
});
