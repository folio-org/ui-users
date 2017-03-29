import React, { Component, PropTypes } from 'react';
import { connect } from '@folio/stripes-connect'; // eslint-disable-line

import Paneset from '@folio/stripes-components/lib/Paneset';
import Pane from '@folio/stripes-components/lib/Pane';
import PaneMenu from '@folio/stripes-components/lib/PaneMenu';
import Icon from '@folio/stripes-components/lib/Icon';
import NavList from '@folio/stripes-components/lib/NavList';
import NavListSection from '@folio/stripes-components/lib/NavListSection';
import PermissionSetDetails from './PermissionSetDetails';

class PermissionSets extends Component {

  static propTypes = {
    stripes: PropTypes.shape({
      hasPerm: PropTypes.func.isRequired,
    }).isRequired,
    data: PropTypes.shape({
      permissionSets: PropTypes.arrayOf(PropTypes.object),
    })
  };

  static manifest = Object.freeze({
    permissionSets: {
      type: 'okapi',
      records: 'permissions',
      // DELETE: {
      //   pk: 'permissionName',
      //   path: 'perms/permissions',
      // },
      // POST: {
      //   pk: 'permissionName',
      //   path: 'perms/permissions',
      // },
      GET: {
        path: 'perms/permissions?length=100&expandSubs=true&query=(mutable=true)'
      },
      path: 'perms/permissions'
    }
  });

  constructor(props) {
    super(props);

    // 'Manager' just for example...
    this.state = {
      selectedSet: null,
    };

    this.onSelectSet = this.onSelectSet.bind(this);
    this.createNewPermissionSet = this.createNewPermissionSet.bind(this);
  }

  onSelectSet(e) {
    e.preventDefault();
    const href = e.target.href;
    const permissionName = href.substring(href.indexOf('#') + 1);
    let selectedSet = null;
    _.forEach(this.props.data.permissionSets, function(set) {
      if(set.permissionName===permissionName) selectedSet=set; 
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

    const { data: { permissionSets } } = this.props;

    const RenderedPermissionSets = this.props.data.permissionSets?this.props.data.permissionSets.map(
      set => <a data-id={set.id} key={set.id} href={`#${set.permissionName}`} onClick={this.onSelectSet}>{set.permissionName}</a>,
    ):[];

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
        {this.state.selectedSet && <PermissionSetDetails stripes={this.props.stripes} initialValues={this.state.selectedSet} selectedSet={this.state.selectedSet} />}
      </Paneset>
    );
  }
}

export default connect(PermissionSets, '@folio/users')
