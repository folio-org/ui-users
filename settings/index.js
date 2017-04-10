import React, { Component, PropTypes } from 'react';

import Paneset from '@folio/stripes-components/lib/Paneset';
import Pane from '@folio/stripes-components/lib/Pane';
import NavList from '@folio/stripes-components/lib/NavList';
import NavListSection from '@folio/stripes-components/lib/NavListSection';

import PermissionSets from './PermissionSets';
import PatronGroupsSettings from './PatronGroupsSettings';

class UsersSettings extends React.Component {

  static propTypes = {
    stripes: PropTypes.shape({
      hasPerm: PropTypes.func.isRequired,
    }).isRequired  
  };

  constructor(props) {
    super(props);

    this.state = {
      selectedPage: 'PatronGroupsSettings',
      pages: [
        { label: 'Permission sets', name: 'PermissionSets', component: PermissionSets },
        { label: 'Patron groups', name: 'PatronGroupsSettings', component: PatronGroupsSettings },
      ],
    };

    this.onSelectPage = this.onSelectPage.bind(this);
  }

  onSelectPage(e) {
    e.preventDefault();
    const href = e.target.href;
    const page = href.substring(href.indexOf('#') + 1);
    this.setState({ selectedPage: page });
  }

  getPage() {
    const result = this.state.pages.filter(obj => obj.name === this.state.selectedPage);
    const Component = result[0].component;
    return <Component stripes={this.props.stripes} />;
  }

  render() {
    return (
      <Paneset nested>
        <Pane defaultWidth="25%" paneTitle="Users">
          <NavList>
            <NavListSection activeLink={`#${this.state.selectedPage}`}>
              <a href="#PatronGroupsSettings" onClick={this.onSelectPage}>Patron Groups</a>
              <a href="#PermissionSets" onClick={this.onSelectPage}>Permission sets</a>
            </NavListSection>
          </NavList>
        </Pane>
        {this.getPage()}
      </Paneset>
    );
  }
}

export default UsersSettings;
