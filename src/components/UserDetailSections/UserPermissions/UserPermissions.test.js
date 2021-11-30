import renderWithRouter from 'helpers/renderWithRouter';
import UserPermissions from './UserPermissions';


jest.unmock('@folio/stripes/components');

const renderUserPermissions = (props) => renderWithRouter(<UserPermissions {...props} />);
const STRIPES = {
  config: {},
  hasPerm: jest.fn().mockReturnValue(true),
};

describe('UserPermissions component', () => {
  it('Component must be rendered', () => {
    const props = {
      accordionId: 'assignedPermissions',
      expanded: true,
      onToggle: jest.fn(),
      heading: <div>User Permissions</div>,
      permToRead: 'perms.permissions.get',
      userPermissions: [
        {
          deprecated: false,
          description: 'Grants all permissions included in Agreements: Search & view agreements plus the ability to delete agreements. This does not include the ability to edit agreements, only to delete them',
          displayName: 'Agreements: Delete agreements',
          grantedTo: ['8fafcfdb-419c-483e-a698-d7f8f46ea694'],
          id: '026bc082-add6-4cdd-a4fd-a588439a57b6',
          moduleName: 'folio_agreements',
          moduleVersion: '8.1.1000825',
          mutable: false,
          permissionName: 'ui-agreements.agreements.delete',
          subPermissions: ['ui-agreements.agreements.view', 'erm.agreements.item.delete'],
          tags: [],
          visible: true,
        },
        {
          deprecated: false,
          description: 'Grants all permissions included in Agreements: Search & view agreements plus the ability to delete agreements. This does not include the ability to edit agreements, only to delete them',
          displayName: 'Agreements: Edit agreements',
          grantedTo: ['8fafcfdb-419c-483e-a698-d7f8f46ea694'],
          id: 'b52da718-7770-407a-af6d-668d258b2309',
          moduleName: 'folio_agreements',
          moduleVersion: '8.1.1000825',
          mutable: false,
          permissionName: 'ui-agreements.agreements.edit',
          subPermissions: ['ui-agreements.agreements.view', 'erm.agreements.item.delete'],
          tags: [],
          visible: true,
        }
      ],
      intl: {},
      stripes: STRIPES,
    };
    renderUserPermissions(props);
    expect(renderUserPermissions(props)).toBeTruthy();
  });
});
