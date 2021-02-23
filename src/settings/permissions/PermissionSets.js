import {
  omit,
  sortBy,
} from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';

import { EntryManager } from '@folio/stripes/smart-components';
import { stripesConnect } from '@folio/stripes/core';

import PermissionSetDetails from './PermissionSetDetails';
import PermissionSetForm from './PermissionSetForm';

function validate(values) {
  const errors = {};

  if (!values.displayName) {
    errors.displayName = <FormattedMessage id="ui-users.permissions.emptyField" />;
  }

  return errors;
}

class PermissionSets extends React.Component {
  static manifest = Object.freeze({
    entries: {
      type: 'okapi',
      records: 'permissions',
      DELETE: {
        path: 'perms/permissions',
      },
      POST: {
        path: 'perms/permissions',
      },
      PUT: {
        path: 'perms/permissions',
      },
      GET: {
        path: 'perms/permissions?length=10000&query=(mutable==true)&expandSubs=true',
      },
      path: 'perms/permissions',
    },
  });

  static propTypes = {
    resources: PropTypes.shape({
      entries: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }).isRequired,
    mutator: PropTypes.shape({
      permissionSets: PropTypes.shape({
        POST: PropTypes.func,
        PUT: PropTypes.func,
        DELETE: PropTypes.func,
      }),
    }).isRequired,
    intl: PropTypes.object,
  };

  beforeSave = (data) => {
    const filtered = omit(data, ['childOf', 'grantedTo', 'dummy', 'deprecated']);
    const permSet = {
      ...filtered,
      mutable: true,
      subPermissions: (data.subPermissions || []).map(p => p.permissionName),
    };

    return permSet;
  }

  render() {
    const {
      mutator,
      resources: { entries },
      intl: { formatMessage },
    } = this.props;

    return (
      <EntryManager
        {...this.props}
        parentMutator={mutator}
        entryList={sortBy((entries || {}).records || [], ['displayName'])}
        detailComponent={PermissionSetDetails}
        paneTitle={<FormattedMessage id="ui-users.settings.permissionSet" />}
        entryLabel={formatMessage({ id: 'ui-users.permissionSet' })}
        entryFormComponent={PermissionSetForm}
        validate={validate}
        onBeforeSave={this.beforeSave}
        nameKey="displayName"
        permissions={{
          put: 'perms.permissions.item.post',
          post: 'perms.permissions.item.post',
          delete: 'perms.permissions.item.delete',
        }}
      />
    );
  }
}

export default stripesConnect(injectIntl(PermissionSets));
