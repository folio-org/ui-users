// We have to remove node_modules/react to avoid having multiple copies loaded.
// eslint-disable-next-line import/no-unresolved
import React, { PropTypes } from 'react';
import Switch from 'react-router-dom/Switch';
import Route from 'react-router-dom/Route';
import Link from 'react-router-dom/Link';

import Paneset from '@folio/stripes-components/lib/Paneset';
import Pane from '@folio/stripes-components/lib/Pane';
import NavList from '@folio/stripes-components/lib/NavList';
import NavListSection from '@folio/stripes-components/lib/NavListSection';

import PermissionSets from './PermissionSets';
import PatronGroupsSettings from './PatronGroupsSettings';


// Should this list be loaded dynamically from configuration?
const pages = [
  {
    route: 'perms',
    label: 'Permission sets',
    name: 'PermissionSets',
    component: PermissionSets,
    perm: 'perms.permissions.get',

  },
  {
    route: 'groups',
    label: 'Patron groups',
    name: 'PatronGroupsSettings',
    component: PatronGroupsSettings,
    // No perm needed yet
  },
];


class UsersSettings extends React.Component {
  static propTypes = {
    stripes: PropTypes.shape({
      hasPerm: PropTypes.func.isRequired,
    }).isRequired,
  };

  render() {
    const navLinks = pages.map(p => (
      <Link
        key={p.route}
        to={`/settings/users/${p.route}`}
      >
        {p.label}
      </Link>
    ));

    const routes = pages.map((p) => {
      const connect = this.props.stripes.connect;
      const Current = connect(p.component);

      return (<Route
        key={p.route}
        path={`/settings/users/${p.route}`}
        render={props => <Current {...props} stripes={this.props.stripes} />}
      />);
    });

    return (
      <Paneset nested defaultWidth="80%">
        <Pane defaultWidth="25%" paneTitle="Users">
          <NavList>
            <NavListSection activeLink="">
              {navLinks}
            </NavListSection>
          </NavList>
        </Pane>
        
        <Switch>
          {routes}
          <Route component={() => <div>Choose category</div>} />
        </Switch>
      </Paneset>
    );
  }
}

export default UsersSettings;
