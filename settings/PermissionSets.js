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
      selectedSet: 'Manager',
      permissionSets: [
        { id: '1', title: 'Manager' },
        { id: '2', title: 'Cataloger' },
      ],
    };

    this.onSelectSet = this.onSelectSet.bind(this);
    this.createNewPermissionSet = this.createNewPermissionSet.bind(this);
  }

  onSelectSet(e) {
    e.preventDefault();
    const href = e.target.href;
    const setTitle = href.substring(href.indexOf('#') + 1);
    this.setState({ selectedSet: setTitle });
  }

  createNewPermissionSet() {
    const sets = this.state.permissionSets;
    let nextSetID = parseInt(sets[sets.length - 1].id, 10);
    nextSetID += 1;
    const newSetObject = { id: nextSetID.toString(), title: 'Untitled Permission Set' };
    sets.push(newSetObject);
    this.setState({
      permissionSets: sets,
      selectedSet: newSetObject.title,
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
            <NavListSection activeLink={`#${this.state.selectedSet}`}>
              {RenderedPermissionSets}
            </NavListSection>
          </NavList>
        </Pane>
        <PermissionSetDetails {...this.props} />
      </Paneset>
    );
  }
}

export default PermissionSets;
