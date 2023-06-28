import renderWithRouter from 'helpers/renderWithRouter';
import RenderPermissions from './RenderPermissions';


jest.unmock('@folio/stripes/components');

const renderRenderPermissions = (props) => renderWithRouter(<RenderPermissions {...props} />);
const STRIPES = {
  config: {},
  hasPerm: jest.fn().mockReturnValue(true),
};

const STRIPESWITHOUTPERMISSION = {
  config: {},
  hasPerm: jest.fn().mockReturnValue(false),
};

describe('render RenderPermissions component', () => {
  it('Component must be rendered', () => {
    const props = {
      accordionId: 'assignedPermissions',
      expanded: true,
      onToggle: jest.fn(),
      heading: <div>Assigned Permissions</div>,
      permToRead: 'perms.permissions.get',
      listedPermissions: [
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
    renderRenderPermissions(props);
    expect(renderRenderPermissions(props)).toBeTruthy();
  });
  it('Checking for permissions', () => {
    const props = {
      accordionId: 'assignedPermissions',
      expanded: true,
      onToggle: jest.fn(),
      heading: <div>Assigned Permissions</div>,
      permToRead: 'perms.permissions.get',
      listedPermissions: [],
      intl: {},
      stripes: STRIPESWITHOUTPERMISSION,
    };
    renderRenderPermissions(props);
    expect(renderRenderPermissions(props)).toBeTruthy();
  });
  it('Passing empty props', () => {
    const props = {
      accordionId: 'assignedPermissions',
      expanded: true,
      onToggle: jest.fn(),
      heading: <div>Assigned Permissions</div>,
      permToRead: 'perms.permissions.get',
      listedPermissions: '',
      intl: {},
      stripes: STRIPES,
    };
    renderRenderPermissions(props);
    expect(renderRenderPermissions(props)).toBeTruthy();
  });
});
