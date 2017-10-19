import React from 'react';
import PropTypes from 'prop-types';

import _ from 'lodash';

import Paneset from '@folio/stripes-components/lib/Paneset';
import Pane from '@folio/stripes-components/lib/Pane';
import PaneMenu from '@folio/stripes-components/lib/PaneMenu';
import Icon from '@folio/stripes-components/lib/Icon';
import NavList from '@folio/stripes-components/lib/NavList';
import NavListSection from '@folio/stripes-components/lib/NavListSection';
import IfPermission from '@folio/stripes-components/lib/IfPermission';
import Callout from '@folio/stripes-components/lib/Callout';

import PermissionSetDetails from './PermissionSetDetails';

class PermissionSets extends React.Component {
  static propTypes = {
    label: PropTypes.string.isRequired,
    stripes: PropTypes.shape({
      hasPerm: PropTypes.func.isRequired,
    }).isRequired,
    resources: PropTypes.shape({
      permissionSets: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }).isRequired,
    mutator: PropTypes.shape({
      permissionSets: PropTypes.shape({
        POST: PropTypes.func,
        DELETE: PropTypes.func,
      }),
    }).isRequired,
  };

  static manifest = Object.freeze({
    permissionSets: {
      type: 'okapi',
      records: 'permissions',
      DELETE: {
        path: 'perms/permissions',
      },
      POST: {
        path: 'perms/permissions',
      },
      GET: {
        path: 'perms/permissions?length=1000&query=(mutable=true)&expandSubs=true',
      },
      path: 'perms/permissions',
    },
  });

  constructor(props) {
    super(props);

    // 'Manager' just for example...

    this.state = {
      selectedSet: null,
    };

    this.navList = null;

    this.onSelectSet = this.onSelectSet.bind(this);
    this.createNewPermissionSet = this.createNewPermissionSet.bind(this);
    this.clearSelection = this.clearSelection.bind(this);
    this.permissionSetsCallout = null;
  }

  componentDidUpdate(prevProps) {
    const permSets = (this.props.resources.permissionSets || {}).records || [];
    const prevPermSets = (prevProps.resources.permissionSets || {}).records || [];

    const permSetsDiffs = _.differenceBy(permSets, prevPermSets, 'id');
    const newPermSet = permSetsDiffs[0];

    if (newPermSet && !newPermSet.pendingCreate) {
      // At this point in the lifecycle the CID is still on the object, and
      // this messes up the saveing of the Permission Set. It should not be needed any longer
      // and will be removed.
      delete newPermSet._cid; // eslint-disable-line no-underscore-dangle

      // Jeremy has investigated that and confirmed that it is harmless.
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        selectedSet: newPermSet,
      });
    }
  }

  onSelectSet(e) {
    e.preventDefault();
    const permissionSets = (this.props.resources.permissionSets || {}).records || [];
    const permissionId = e.target.dataset.id;

    _.forEach(permissionSets, (set) => {
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

  createNewPermissionSet() {
    this.props.mutator.permissionSets.POST({
      mutable: true,
    });
  }

  render() {
    const permissionSets = (this.props.resources.permissionSets || {}).records || [];

    const RenderedPermissionSets = permissionSets.length ? permissionSets.map(
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
        <Pane defaultWidth="25%" lastMenu={PermissionsSetsLastMenu} paneTitle={this.props.label}>
          <NavList>
            <NavListSection activeLink={this.state.selectedSet ? `#${this.state.selectedSet.id}` : ''}>
              {RenderedPermissionSets}
            </NavListSection>
          </NavList>
        </Pane>
        {this.state.newSet && <PermissionSetDetails parentMutator={this.props.mutator} clearSelection={this.clearSelection} stripes={this.props.stripes} selectedSet={{}} initialValues={{}} />}
        {this.state.selectedSet && !this.state.newSet && <PermissionSetDetails callout={this.permissionSetsCallout} parentMutator={this.props.mutator} clearSelection={this.clearSelection} stripes={this.props.stripes} initialValues={this.state.selectedSet} selectedSet={this.state.selectedSet} />}
        <Callout ref={(ref) => {this.permissionSetsCallout = ref;}} />
      </Paneset>
    );
  }
}

export default PermissionSets;
