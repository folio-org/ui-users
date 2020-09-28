import React from 'react';
import PropTypes from 'prop-types';
import {
  get,
  remove,
} from 'lodash';
import { FormattedMessage } from 'react-intl';

import { stripesConnect } from '@folio/stripes/core';
import {
  Button,
  Modal,
  Pane,
  Paneset,
  PaneHeader,
} from '@folio/stripes/components';

import {
  ExpandFilterPaneButton,
  CollapseFilterPaneButton,
} from '@folio/stripes/smart-components';

import SearchForm from '../SearchForm';
import PermissionsList from '../PermissionsList';
import { getInitialFiltersState } from '../../helpers';

import css from './PermissionsModal.css';

class PermissionsModal extends React.Component {
  static manifest = Object.freeze({
    availablePermissions: {
      type: 'okapi',
      records: 'permissions',
      path: (queryParams, pathComponents, resourceData, config, props) => {
        const {
          stripes: { config : { listInvisiblePerms } },
          excludePermissionSets,
        } = props;
        const query = [
          ...(listInvisiblePerms ? [] : ['visible==true']),
          ...(excludePermissionSets ? ['mutable==false'] : []),
        ];
        const queryString = query.length
          ? `query=(${query.join(' and ')})`
          : '';

        return `perms/permissions?length=10000&${queryString}`;
      },
      fetch: false,
      accumulate: true,
    },
  });

  static propTypes = {
    mutator: PropTypes.shape({
      availablePermissions: PropTypes.shape({
        GET: PropTypes.func.isRequired,
        reset: PropTypes.func.isRequired,
      }),
    }),
    resources: PropTypes.shape({
      availablePermissions: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }),
    filtersConfig: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.node.isRequired,
        name: PropTypes.string.isRequired,
        cql: PropTypes.string.isRequired,
        filter: PropTypes.func.isRequired,
        values: PropTypes.arrayOf(
          PropTypes.shape({
            name: PropTypes.string.isRequired,
            displayName: PropTypes.element.isRequired,
            value: PropTypes.bool.isRequired,
          }),
        ).isRequired,
      })
    ).isRequired,
    assignedPermissions: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        displayName: PropTypes.string.isRequired,
        permissionName: PropTypes.string.isRequired,
        subPermissions: PropTypes.arrayOf(PropTypes.string).isRequired,
        dummy: PropTypes.bool.isRequired,
        mutable: PropTypes.bool.isRequired,
        visible: PropTypes.bool.isRequired,
      })
    ).isRequired,
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    addPermissions: PropTypes.func.isRequired,
    visibleColumns: PropTypes.arrayOf(PropTypes.string).isRequired,
    excludePermissionSets: PropTypes.bool,
  };

  static defaultProps = {
    resources: { availablePermissions: { records: [] } },
    excludePermissionSets: false,
  };

  constructor(props) {
    super(props);

    this.state = {
      filterPaneIsVisible: true,
      permissions: [],
      filters: getInitialFiltersState(props.filtersConfig),
      assignedPermissionIds: props.assignedPermissions.map(({ id }) => id)
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

  onSubmitSearch = (searchText) => {
    const permissions = get(this.props, 'resources.availablePermissions.records', []);

    const filteredPermissions = permissions.filter(({ displayName, permissionName }) => {
      const permissionText = displayName || permissionName;

      return permissionText.toLowerCase().includes(searchText.toLowerCase());
    });

    this.setState({ permissions: filteredPermissions });
  };

  toggleFilterPane = () => {
    this.setState(curState => ({
      filterPaneIsVisible: !curState.filterPaneIsVisible,
    }));
  };

  onChangeFilter = ({ target: { name, checked } }) => {
    this.setState((prevState) => {
      if (checked) {
        prevState.filters[name] = checked;
      } else {
        delete prevState.filters[name];
      }

      return prevState;
    });
  };

  togglePermission = (permissionId) => {
    this.setState(({ assignedPermissionIds }) => {
      const permissionAssigned = assignedPermissionIds.includes(permissionId);

      if (permissionAssigned) {
        remove(assignedPermissionIds, (id) => id === permissionId);
      } else {
        assignedPermissionIds.push(permissionId);
      }

      return { assignedPermissionIds };
    });
  };

  onSave = () => {
    const { assignedPermissionIds } = this.state;
    const {
      addPermissions,
      onClose,
    } = this.props;
    const permissions = get(this.props, 'resources.availablePermissions.records', []);
    const filteredPermissions = permissions.filter(({ id }) => assignedPermissionIds.includes(id));

    addPermissions(filteredPermissions);
    onClose();
  };

  setAssignedPermissionIds = (assignedPermissionIds) => {
    this.setState({ assignedPermissionIds });
  };

  onClearFilter = (filterName) => {
    this.setState(({ filters }) => {
      Object.keys(filters).forEach((key) => {
        if (key.startsWith(filterName)) {
          delete filters[key];
        }
      });

      return filters;
    });
  };

  resetSearchForm = () => {
    const permissions = get(this.props, 'resources.availablePermissions.records', []);

    this.setState({
      filters: {},
      permissions,
      assignedPermissionIds: this.props.assignedPermissions.map(({ id }) => id),
    });
  };

  render() {
    const {
      permissions,
      filters,
      assignedPermissionIds,
      filterPaneIsVisible,
    } = this.state;
    const {
      open,
      onClose,
      filtersConfig,
      visibleColumns,
    } = this.props;

    let filteredPermissions = permissions;
    const FilterGroupsConfig = [];

    filtersConfig.forEach((filterData) => {
      // eslint-disable-next-line no-unused-vars
      const { filter, ...filterConfig } = filterData;

      filteredPermissions = filterData.filter(filteredPermissions, filters, assignedPermissionIds);
      FilterGroupsConfig.push(filterConfig);
    });

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
          <div className={css.modalFooter}>
            <Button
              id="clickable-permissions-modal-cancel"
              data-test-permissions-modal-cancel
              onClick={onClose}
              marginBottom0
            >
              <FormattedMessage id="ui-users.permissions.modal.cancel" />
            </Button>
            <div>
              <FormattedMessage
                id="ui-users.permissions.modal.total"
                values={{ count: assignedPermissionIds.length }}
              />
            </div>
            <Button
              id="clickable-permissions-modal-save"
              data-test-permissions-modal-save
              marginBottom0
              buttonStyle="primary"
              onClick={this.onSave}
            >
              <FormattedMessage id="ui-users.saveAndClose" />
            </Button>
          </div>
        }
      >
        <div>
          <Paneset isRoot>
            {filterPaneIsVisible &&
              <Pane
                defaultWidth="30%"
                renderHeader={renderProps => (
                  <PaneHeader
                    {...renderProps}
                    paneTitle={<FormattedMessage id="ui-users.permissions.modal.search.header" />}
                    lastMenu={<CollapseFilterPaneButton onClick={this.toggleFilterPane} />}
                    className={css.modalHeader}
                  />
                )}
              >
                <SearchForm
                  config={FilterGroupsConfig}
                  filters={filters}
                  onClearFilter={this.onClearFilter}
                  onSubmitSearch={this.onSubmitSearch}
                  onChangeFilter={this.onChangeFilter}
                  resetSearchForm={this.resetSearchForm}
                />
              </Pane>
            }
            <Pane
              defaultWidth="fill"
              renderHeader={renderProps => (
                <PaneHeader
                  {...renderProps}
                  className={css.modalHeader}
                  paneTitle={<FormattedMessage id="ui-users.permissions.modal.list.pane.header" />}
                  paneSub={
                    <FormattedMessage
                      id="ui-users.permissions.modal.list.pane.subheader"
                      values={{ amount: filteredPermissions.length }}
                    />
                  }
                  {...(filterPaneIsVisible || {
                    firstMenu: (
                      <ExpandFilterPaneButton
                        onClick={this.toggleFilterPane}
                        filterCount={filters.count}
                      />
                    )
                  }
                  )}
                />
              )}
            >
              <PermissionsList
                visibleColumns={visibleColumns}
                filteredPermissions={filteredPermissions}
                assignedPermissionIds={assignedPermissionIds}
                togglePermission={this.togglePermission}
                setAssignedPermissionIds={this.setAssignedPermissionIds}
              />
            </Pane>
          </Paneset>
        </div>
      </Modal>
    );
  }
}

export default stripesConnect(PermissionsModal);
