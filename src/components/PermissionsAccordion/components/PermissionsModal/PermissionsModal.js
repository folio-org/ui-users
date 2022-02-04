import React from 'react';
import PropTypes from 'prop-types';
import {
  mapKeys,
  pickBy,
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
    stripes: PropTypes.shape({
      okapi: PropTypes.shape({
        translations: PropTypes.object,
      }).isRequired,
    }).isRequired,
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

    this._isMounted = false;

    this.state = {
      // There are two 'permissions' vars in play here:
      // `allPermissions` is intended to be a fixed copy of the records from the
      // availablePermissions resource. Using this as a source of truth prevents
      // the permissions duplication problem specified in UIU-2496.
      // `permissions` begins as a second copy of the resource records, but it can
      // change in response to a search query.
      allPermissions: [],
      permissions: [],
      assignedPermissionIds: [],
      filterPaneIsVisible: true,
      filters: getInitialFiltersState(props.filtersConfig)
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

    this._isMounted = true;

    await reset();
    const permissions = await GET();

    // don't set state if the component has unmounted,
    // which it may have since this function is async
    if (this._isMounted) {
      this.setState({
        allPermissions: permissions,
        permissions,
        assignedPermissionIds: this.props.assignedPermissions.map(({ id }) => id)
      });
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  // Search for permissions
  onSubmitSearch = (searchText) => {
    const permissions = this.state.allPermissions || [];
    // Need a bit of extra work to search for terms that might appear only in a translated label
    const translationResults = this.getMatchedTranslations(searchText, permissions);

    // Search in permission display names or permission names
    const filteredPermissions = permissions.filter(({ displayName, permissionName }) => {
      const permissionText = displayName || permissionName;
      return permissionText.toLowerCase().includes(searchText.toLowerCase());
    });

    // Combine the search results from translated labels with those of permission/display names
    const mergedPermissions = [...new Set([...filteredPermissions, ...translationResults])];

    this.setState({ permissions: mergedPermissions });
  };

  // Given a search query, which can be part of a permission name or permission display name,
  // and a set of permissions, return a subset of permissions for which the query
  // appears in the *translated* display name (if found in Okapi translations).
  getMatchedTranslations = (query, permissions) => {
    const translations = this.props.stripes.okapi.translations;

    // Translations are received from Stripes as an object with properties of the form
    // <translation key>: <translated label/display name>. To avoid cluttering search
    // results with things that aren't permissions, we check for the string '.permission.',
    // in the translation key, e.g. ui-users.permission.loans.all, before looking for the
    // search query.
    const matchedPermTranslations = pickBy(translations, (label, key) => {
      // non-AST translations are key-value pairs and the value is a string.
      // AST-ified translations are key-value pairs and the value is an array.
      // when that array has only a single element, it contains an object with
      // the property "value" that contains the translation value.
      // multi-value arrays correspond to translations with substitutions, html, etc.,
      // but those are not relevent here.
      if (typeof label === 'string') {
        return /\.permission\./.test(key) && label.toLowerCase().match(query.toLowerCase());
      } else if (Array.isArray(label) && label.length === 1) {
        return /\.permission\./.test(key) && label[0].value.toLowerCase().match(query.toLowerCase());
      }
      return false;
    });

    // Matched permissions may not have a displayName value. We have to compare a permission's
    // permissionName value to a matched translation string key, which is not quite the same:
    // permissionName: ui-users.settings.departments.all
    // translation key: ui-users.permission.settings.departments.all
    // This transforms the matched permission translations into a dictionary of permissionNames/translations.
    // BUT -- this assumes that all permission translation keys are identifiable by the inclusion of
    // the string '.permission.', which seems rather optimistic.
    const matchedPermissionKeys = mapKeys(matchedPermTranslations, (v, k) => k.replace('permission.', ''));

    // Return the subset of all permissions that appears in the matched translations
    return permissions.filter(p => matchedPermissionKeys[p.permissionName]);
  }

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
    const {
      allPermissions,
      assignedPermissionIds,
    } = this.state;
    const {
      addPermissions,
      assignedPermissions,
      onClose,
    } = this.props;
    const filteredPermissions = allPermissions.filter(({ id }) => assignedPermissionIds.includes(id));

    // Invisible permissions assigned to a user are lost in the permissions selection process,
    // so we want to make sure that they get saved along with any visible selections. This renders
    // it impossible to *remove* invisible permissions in the UI, but that's probably better
    // than making it impossible to *keep* invisible permissions in the UI.
    const invisiblePermissions = assignedPermissions.filter(p => !p.visible);

    addPermissions([...filteredPermissions, ...invisiblePermissions]);
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
    this.setState(prevState => {
      const permissions = prevState.allPermissions || [];

      return ({
        filters: {},
        permissions,
        assignedPermissionIds: this.props.assignedPermissions.map(({ id }) => id)
      });
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
