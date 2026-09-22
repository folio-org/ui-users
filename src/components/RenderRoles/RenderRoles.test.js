import renderWithRouter from 'helpers/renderWithRouter';
import { IfPermission } from '@folio/stripes/core';
import RenderRoles from './RenderRoles';


jest.unmock('@folio/stripes/components');

const renderRenderRoles = (props) => renderWithRouter(<RenderRoles {...props} />);
const STRIPES = {
  config: {},
  hasPerm: jest.fn().mockReturnValue(true),
};

const STRIPESWITHOUTPERMISSION = {
  config: {},
  hasPerm: jest.fn().mockReturnValue(false),
};

describe('render RenderRoles component', () => {
  it('Component must be rendered', () => {
    const props = {
      accordionId: 'assignedRoles',
      expanded: true,
      onToggle: jest.fn(),
      heading: <div>Assigned roles</div>,
      permToRead: 'perms.permissions.get',
      listedRoles: [
        {
          'id': '024f7895-45fa-4ea7-ba06-a6a51758559f',
          'name': 'funky',
          'description': 'get down get down'
        },
        {
          'id': '27b6cf82-303a-4737-b2d8-c5bc807f077f',
          'name': 'chicken',
          'description': 'look up look up, the sky is falling!'
        }
      ],
      intl: {},
      stripes: STRIPES,
    };
    renderRenderRoles(props);
    expect(renderRenderRoles(props)).toBeTruthy();
  });

  it('Checking for roles', () => {
    const props = {
      accordionId: 'assignedRoles',
      expanded: true,
      onToggle: jest.fn(),
      heading: <div>Assigned Permissions</div>,
      permToRead: 'perms.permissions.get',
      listedPermissions: [],
      intl: {},
      stripes: STRIPESWITHOUTPERMISSION,
    };
    renderRenderRoles(props);
    expect(renderRenderRoles(props)).toBeTruthy();
  });

  it('Passing empty props', () => {
    const props = {
      accordionId: 'assignedRoles',
      expanded: true,
      onToggle: jest.fn(),
      heading: <div>Assigned Permissions</div>,
      permToRead: 'perms.permissions.get',
      listedRoles: [],
      intl: {},
      stripes: STRIPES,
    };
    renderRenderRoles(props);
    expect(renderRenderRoles(props)).toBeTruthy();
  });

  describe('role name link permission guard', () => {
    const props = {
      accordionId: 'assignedRoles',
      expanded: true,
      onToggle: jest.fn(),
      heading: <div>Assigned roles</div>,
      permToRead: 'perms.permissions.get',
      listedRoles: [
        { id: '024f7895-45fa-4ea7-ba06-a6a51758559f', name: 'funky', description: '' },
      ],
      intl: {},
      stripes: STRIPES,
    };

    afterEach(() => {
      IfPermission.mockClear();
    });

    it('renders the role name as a link when the user has permission', () => {
      IfPermission.mockImplementation(({ children }) => children({ hasPermission: true }));

      const { getByText } = renderRenderRoles(props);
      const link = getByText('funky');

      expect(link.closest('a')).toHaveAttribute('href', '/settings/authorization-roles/024f7895-45fa-4ea7-ba06-a6a51758559f');
    });

    it('renders the role name as plain text when the user lacks permission', () => {
      IfPermission.mockImplementation(({ children }) => children({ hasPermission: false }));

      const { getByText } = renderRenderRoles(props);
      const text = getByText('funky');

      expect(text.closest('a')).not.toBeInTheDocument();
    });
  });
});
