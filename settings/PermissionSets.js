// We have to remove node_modules/react to avoid having multiple copies loaded.
// eslint-disable-next-line import/no-unresolved
import React, { Component, PropTypes } from 'react';
import _ from 'lodash';

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
    }).isRequired,
    mutator: PropTypes.shape({
      permissionSets: PropTypes.shape({
        POST: PropTypes.func,
        DELETE: PropTypes.func,
        GET: PropTypes.func,
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
        path: 'perms/permissions?length=100&query=(mutable=true)',
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

    this.onSelectSet = this.onSelectSet.bind(this);
    this.createNewPermissionSet = this.createNewPermissionSet.bind(this);
    this.clearSelection = this.clearSelection.bind(this);
  }

  onSelectSet(e) {
    e.preventDefault();
    const href = e.target.href;
    const permissionName = href.substring(href.indexOf('#') + 1);
    let selectedSet = null;
    _.forEach(this.props.data.permissionSets, (set) => {
      if (set.permissionName === permissionName) selectedSet = set;
    });
    this.setState({ selectedSet });
  }

  createNewPermissionSet() {
    this.props.mutator.permissionSets.POST({
      mutable: true,
    }).then(() => {
      this.clearSelection();
    });
  }

  clearSelection() {
    this.setState({
      selectedSet: null,
    });
  }

  render() {
    const RenderedPermissionSets = this.props.data.permissionSets ? this.props.data.permissionSets.map(
      set => <a data-id={set.id} key={set.id} href={`#${set.permissionName}`} onClick={this.onSelectSet}>{set.displayName ? set.displayName : 'Untitled Permission Set'}</a>,
    ) : [];

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
            <NavListSection activeLink={this.state.selectedSet ? `#${this.state.selectedSet.title}` : ''}>
              {RenderedPermissionSets}
            </NavListSection>
          </NavList>
        </Pane>
        {this.state.selectedSet && <PermissionSetDetails parentMutator={this.props.mutator} clearSelection={this.clearSelection} stripes={this.props.stripes} initialValues={this.state.selectedSet} selectedSet={this.state.selectedSet} />}
      </Paneset>
    );
  }
}

export default PermissionSets;
