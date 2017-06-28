// We have to remove node_modules/react to avoid having multiple copies loaded.
// eslint-disable-next-line import/no-unresolved
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import _ from 'lodash';

import Paneset from '@folio/stripes-components/lib/Paneset';
import Pane from '@folio/stripes-components/lib/Pane';
import PaneMenu from '@folio/stripes-components/lib/PaneMenu';
import Icon from '@folio/stripes-components/lib/Icon';
import NavList from '@folio/stripes-components/lib/NavList';
import NavListSection from '@folio/stripes-components/lib/NavListSection';
import IfPermission from '@folio/stripes-components/lib/IfPermission';
import PermissionSetDetails from './PermissionSetDetails';

class PermissionSets extends Component {
  static propTypes = {
    stripes: PropTypes.shape({
      hasPerm: PropTypes.func.isRequired,
    }).isRequired,
    data: PropTypes.shape({
      permissionSets: PropTypes.arrayOf(PropTypes.object),
    }).isRequired,
    mutator: PropTypes.shape({
      updater: PropTypes.shape({
        POST: PropTypes.func,
        DELETE: PropTypes.func,
      }),
    }).isRequired,
  };

  static manifest = Object.freeze({
    permissionSets: {
      type: 'okapi',
      records: 'permissions',
      path: 'perms/permissions?length=1000&query=(mutable=true)&expandSubs=true',
    },
    updater: {
      type: 'okapi',
      records: 'permissions',
      path: 'perms/permissions',
    },
  });

  constructor(props) {
    super(props);

    this.state = {
      selectedSet: null,
      newSet: false,
    };

    this.navList = null;

    this.onSelectSet = this.onSelectSet.bind(this);
    this.createNewPermissionSet = this.createNewPermissionSet.bind(this);
    this.clearSelection = this.clearSelection.bind(this);
    this.recordHasBeenCreated = this.recordHasBeenCreated.bind(this);
  }

  componentDidUpdate(prevProps) {
    const permSetsDiffs = _.differenceBy(this.props.data.permissionSets, prevProps.data.permissionSets, 'id');
    const newPermSet = permSetsDiffs[0];

    if (newPermSet && !newPermSet.pendingCreate) {
      // At this point in the lifecycle the CID is still on the object, and
      // this messes up the saveing of the Permission Set. It should not be needed any longer
      // and will be removed.
      delete newPermSet._cid; // eslint-disable-line no-underscore-dangle

      // Jeremy has investigated that and confirmed that it is harmless.
      // eslint-disable-next-line react/no-did-update-set-state
      this.setSelectedSet(newPermSet);
    }
  }

  onSelectSet(e) {
    e.preventDefault();
    const permissionId = e.target.dataset.id;
    _.forEach(this.props.data.permissionSets, (set) => {
      if (set.id === permissionId) {
        this.setSelectedSet(set);
      }
    });
  }

  setSelectedSet(set) {
    this.setState({
      selectedSet: set,
    });
  }

  clearSelection() {
    this.setSelectedSet(null);
  }

  // It's ugly that we need this. Too much state shared between this and <PermissionSetDetails>
  recordHasBeenCreated() {
    this.setState({ newSet: false });
  }

  createNewPermissionSet() {
    this.setState({ newSet: true });
  }

  render() {
    const RenderedPermissionSets = this.props.data.permissionSets ? this.props.data.permissionSets.map(
      set => <a data-id={set.id} key={set.id} href={`#${set.permissionName}`} onClick={this.onSelectSet}>{set.displayName ? set.displayName : 'Untitled Permission Set'}</a>,
    ) : [];

    const PermissionsSetsLastMenu = (
      <IfPermission perm="perms.permissions.item.post">
        {/* In practice, there is point letting someone create a set if they can't set its name */}
        <IfPermission perm="perms.permissions.item.put">
          <PaneMenu>
            <button title="Add Permission Set" onClick={this.createNewPermissionSet}>
              <Icon icon="plus-sign" />
            </button>
          </PaneMenu>
        </IfPermission>
      </IfPermission>
    );

    return (
      <Paneset nested>
        <Pane defaultWidth="20%" lastMenu={PermissionsSetsLastMenu}>
          <NavList>
            <NavListSection activeLink={this.state.selectedSet ? `#${this.state.selectedSet.id}` : ''}>
              {RenderedPermissionSets}
            </NavListSection>
          </NavList>
        </Pane>
        {this.state.newSet && <PermissionSetDetails parentMutator={this.props.mutator} clearSelection={this.clearSelection} stripes={this.props.stripes} selectedSet={{}} initialValues={{}} tellParentTheRecordHasBeenCreated={this.recordHasBeenCreated} />}
        {this.state.selectedSet && !this.state.newSet && <PermissionSetDetails parentMutator={this.props.mutator} clearSelection={this.clearSelection} stripes={this.props.stripes} initialValues={this.state.selectedSet} selectedSet={this.state.selectedSet} />}
      </Paneset>
    );
  }
}

export default PermissionSets;
