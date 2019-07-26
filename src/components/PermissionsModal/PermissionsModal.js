import {
  get,
  orderBy,
  remove,
} from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { connect as reduxConnect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { change } from 'redux-form';

import { stripesConnect } from '@folio/stripes/core';
import {
  Button,
  Modal,
  Pane,
  Paneset,
} from '@folio/stripes/components';

import SearchForm from './components/SearchForm';
import PermissionsList from './components/PermissionsList';
import { sortOrders } from './constants';

import css from './PermissionsModal.css';

class PermissionsModal extends React.Component {
  static manifest = Object.freeze({
    availablePermissions: {
      type: 'okapi',
      records: 'permissions',
      path: 'perms/permissions?length=10000&query=(mutable==false and visible==true)',
      fetch: false,
      accumulate: true,
    },
  });

  static propTypes = {
    mutator: PropTypes.shape({
      availablePermissions: PropTypes.shape({
        GET: PropTypes.func.isRequired,
        reset: PropTypes.func.isRequired,
        POST: PropTypes.func.isRequired,
      }),
    }),
    resources: PropTypes.shape({
      availablePermissions: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }),
    subPermissions: PropTypes.arrayOf(PropTypes.object).isRequired,
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    addSubPermissions: PropTypes.func.isRequired,
  };

  static defaultProps = {
    resources: { availablePermissions: { records: [] } },
  };

  constructor(props) {
    super(props);

    this.config = [
      {
        label: (<FormattedMessage id="ui-users.permissions.modal.filter.status.label" />),
        name: 'status',
        cql: 'status',
        values: ['Assigned', 'Unassigned'],
      },
    ];

    this.state = {
      searchText: '',
      allChecked: false,
      permissions: [],
      sortedColumn: 'permissionName',
      sortOrder: sortOrders.asc.name,
      filters: {
        'status.Unassigned': true,
        'status.Assigned': false,
      },
      subPermissionsIds: props.subPermissions.map(({ id }) => id)
    };
  }

  async componentDidMount() {
    const {
      mutator: {
        availablePermissions: {
          GET,
          reset,
        }
      }
    } = this.props;

    await reset();
    const permissions = await GET();

    this.setState({ permissions });
  }

  onSubmitSearch = (e) => {
    e.stopPropagation();
    e.preventDefault();
    const permissions = get(this.props, 'resources.availablePermissions.records', []);
    const { searchText } = this.state;

    const filteredPermissions = permissions.filter(({ displayName, permissionName }) => {
      const permissionText = displayName || permissionName;

      return permissionText.toLowerCase().includes(searchText.toLowerCase());
    });

    this.setState({ permissions: filteredPermissions });
  };

  onSearchChange = ({ target: { value: searchText } }) => {
    this.setState({ searchText });
  };

  onHeaderClick = (e, { name: columnName }) => {
    const {
      sortOrder,
      sortedColumn,
    } = this.state;

    if (sortedColumn !== columnName) {
      this.setState({
        sortedColumn: columnName,
        sortOrder: sortOrders.desc.name,
      });
    } else {
      const newSortOrder = (sortOrder === sortOrders.desc.name)
        ? sortOrders.asc.name
        : sortOrders.desc.name;
      this.setState({ sortOrder: newSortOrder });
    }
  };

  onChangeFilter = ({ target }) => {
    const { filters } = this.state;

    filters[target.name] = target.checked;
    this.setState({ filters });
  };

  togglePermission = (permissionId) => {
    this.setState(({ subPermissionsIds }) => {
      const permissionAssigned = subPermissionsIds.includes(permissionId);

      if (permissionAssigned) {
        remove(
          subPermissionsIds,
          (id) => id === permissionId
        );
      } else {
        subPermissionsIds.push(permissionId);
      }

      return { subPermissionsIds };
    });
  };

  onSave = () => {
    const { subPermissionsIds } = this.state;
    const {
      addSubPermissions,
      onClose,
    } = this.props;
    const permissions = get(this.props, 'resources.availablePermissions.records', []);
    const filteredPermissions = permissions.filter(({ id }) => subPermissionsIds.includes(id));

    addSubPermissions(filteredPermissions);
    onClose();
  };

  toggleAllPermissions = () => {
    const { allChecked } = this.state;
    let subPermissionsIds = [];

    if (!allChecked) {
      const permissions = get(this.props, 'resources.availablePermissions.records', []);

      subPermissionsIds = permissions.map(({ id }) => id);
    }

    this.setState({
      allChecked: !allChecked,
      subPermissionsIds,
    });
  };

  onClearFilter = (filterName) => {
    this.setState(({ filters }) => {
      Object.keys(filters).forEach((key) => {
        if (key.startsWith(filterName)) {
          filters[key] = false;
        }
      });

      return filters;
    });
  };

  resetSearchForm = () => {
    this.setState(({ filters }) => {
      const permissions = get(this.props, 'resources.availablePermissions.records', []);

      Object.keys(filters).forEach((key) => { filters[key] = false; });

      return {
        searchText: '',
        filters,
        permissions,
      };
    });
  };

  render() {
    const {
      permissions,
      sortedColumn,
      sortOrder,
      filters,
      filters: {
        'status.Unassigned': Unassigned,
        'status.Assigned': Assigned,
      },
      subPermissionsIds,
      allChecked,
      searchText,
    } = this.state;
    const {
      open,
      onClose,
    } = this.props;

    const sorters = {
      permissionName: ({ permissionName }) => permissionName,
      status: ({ id, permissionName }) => [subPermissionsIds.includes(id), permissionName],
    };
    const filteredPermissions = permissions.filter(({ id }) => {
      const permissionAssigned = subPermissionsIds.includes(id);

      return (
        (Unassigned && !permissionAssigned && !Assigned)
        || (!Unassigned && permissionAssigned && Assigned)
        || (Unassigned && Assigned)
      );
    });

    const sortedPermissions = orderBy(filteredPermissions, sorters[sortedColumn], sortOrder);

    return (
      <Modal
        open={open}
        id="permissions-modal"
        dismissible
        label={<FormattedMessage id="ui-users.permissions.modal.header" />}
        size="large"
        showHeader
        onClose={onClose}
        contentClass={css.modalContent}
        footer={
          <React.Fragment>
            <Button
              onClick={onClose}
              buttonStyle="primary"
              marginBottom0
            >
              <FormattedMessage id="ui-users.permissions.modal.cancel" />
            </Button>
            <Button
              marginBottom0
              onClick={this.onSave}
            >
              <FormattedMessage id="ui-users.permissions.modal.save" />
            </Button>
          </React.Fragment>
        }
      >
        <div>
          <Paneset>
            <Pane
              defaultWidth="30%"
              paneTitle={<FormattedMessage id="ui-users.permissions.modal.search.header" />}
            >
              <SearchForm
                config={this.config}
                filters={filters}
                searchText={searchText}
                onClearFilter={this.onClearFilter}
                onSubmitSearch={this.onSubmitSearch}
                onSearchChange={this.onSearchChange}
                onChangeFilter={this.onChangeFilter}
                resetSearchForm={this.resetSearchForm}
              />
            </Pane>
            <Pane
              paneTitle={<FormattedMessage id="ui-users.permissions.modal.list.pane.header" />}
              paneSub={
                <FormattedMessage
                  id="ui-users.permissions.modal.list.pane.subheader"
                  values={{ amount: sortedPermissions.length }}
                />
              }
              defaultWidth="70%"
            >
              <PermissionsList
                allChecked={allChecked}
                sortOrder={sortOrder}
                sortedColumn={sortedColumn}
                sortedPermissions={sortedPermissions}
                subPermissionsIds={subPermissionsIds}
                onHeaderClick={this.onHeaderClick}
                togglePermission={this.togglePermission}
                toggleAllPermissions={this.toggleAllPermissions}
              />
            </Pane>
          </Paneset>
        </div>
      </Modal>
    );
  }
}

const mapStateToProps = state => ({
  subPermissions: state.form.permissionSetForm.values.subPermissions || [],
});

const mapDispatchToProps = dispatch => ({
  addSubPermissions: (permissions) => dispatch(change('permissionSetForm', 'subPermissions', permissions)),
});

export default stripesConnect(reduxConnect(mapStateToProps, mapDispatchToProps)(PermissionsModal));
