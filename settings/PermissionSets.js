import React from 'react';

import Paneset from '@folio/stripes-components/lib/Paneset';
import Pane from '@folio/stripes-components/lib/Pane';
import PaneMenu from '@folio/stripes-components/lib/PaneMenu';
import Icon from '@folio/stripes-components/lib/Icon';
import NavList from '@folio/stripes-components/lib/NavList';
import NavListSection from '@folio/stripes-components/lib/NavListSection';
import PermissionSetDetails from './PermissionSetDetails';

class PermissionSets extends React.Component {
  constructor(props) {
    super(props);

    // 'Manager' just for example...
    this.state = {
      selectedSet: null,
      permissionSets: [
        { id: '1', title: 'Manager', description: 'Permissions for Manager'},
        { id: '2', title: 'Cataloger', description: 'Permissions for Cataloger'},
      ],
    };

    this.onSelectSet = this.onSelectSet.bind(this);
    this.createNewPermissionSet = this.createNewPermissionSet.bind(this);
  }

  onSelectSet(e) {
    e.preventDefault();
    const href = e.target.href;
    const setTitle = href.substring(href.indexOf('#') + 1);
    let selectedSet = null;
    _.forEach(this.state.permissionSets, function(set) {
      if(set.title===setTitle) selectedSet=set; 
    });
    this.setState({ selectedSet: selectedSet });
  }

  createNewPermissionSet() {
    const sets = this.state.permissionSets;
    let nextSetID = parseInt(sets[sets.length - 1].id, 10);
    nextSetID += 1;
    const newSetObject = { id: nextSetID.toString(), title: 'Untitled Permission Set' };
    sets.push(newSetObject);
    this.setState({
      permissionSets: sets,
      selectedSet: newSetObject,
    });
  }

  render() {
    const RenderedPermissionSets = this.state.permissionSets.map(
      set => <a data-id={set.id} key={set.id} href={`#${set.title}`} onClick={this.onSelectSet}>{set.title}</a>,
    );

    const PermissionsSetsLastMenu = (
      <PaneMenu>
        <button title="Add Permission Set" onClick={this.createNewPermissionSet}>
          <Icon icon="plus-sign" />
        </button>
      </PaneMenu>
    );

    return (
      <Paneset nested>
        <Pane defaultWidth="20%" lastMenu={PermissionsSetsLastMenu}>
          <NavList>
            <NavListSection activeLink={this.state.selectedSet?`#${this.state.selectedSet.title}`:''}>
              {RenderedPermissionSets}
            </NavListSection>
          </NavList>
        </Pane>
        {this.state.selectedSet && <PermissionSetDetails initialValues={this.state.selectedSet} selectedSet={this.state.selectedSet} />}
      </Paneset>
    );
  }
}

export default PermissionSets;
