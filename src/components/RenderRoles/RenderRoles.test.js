import renderWithRouter from 'helpers/renderWithRouter';
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
});
