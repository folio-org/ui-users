import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { stripesConnect } from '@folio/stripes/core';
import { withTags } from '@folio/stripes/smart-components';

import { UserDetail } from '../views';

import {
  withProxy,
  withServicePoints
} from '../components/Wrappers';
import { departmentsShape } from '../shapes';
import { MAX_RECORDS } from '../constants';

class UserRecordContainer extends React.Component {
  static manifest = Object.freeze({
    query: {},
    permUserId: {},   // ID of the current permissions user record (see UserEdit.js)
    selUser: {
      type: 'okapi',
      path: 'users/:{id}',
      clear: false,
      shouldRefresh: (resource, action, refresh) => {
        const { path } = action.meta;
        return refresh || (path && path.match(/link/));
      },
      throwErrors: false,
    },
    hasManualPatronBlocks: {
      type: 'okapi',
      records: 'manualblocks',
      path: 'manualblocks?query=(userId==:{id})&limit=2000',
      permissionsRequired: 'manualblocks.collection.get',
    },
    hasAutomatedPatronBlocks: {
      type: 'okapi',
      records: 'automatedPatronBlocks',
      path: 'automated-patron-blocks/:{id}',
      params: { limit: '2000' },
      permissionsRequired: 'automated-patron-blocks.collection.get',
    },
    loansHistory: {
      type: 'okapi',
      records: 'loans',
      path: 'circulation/loans?query=(userId==:{id}) sortby id&limit=2000',
      permissionsRequired: 'circulation.loans.collection.get',
    },
    patronGroups: {
      type: 'okapi',
      path: 'groups',
      params: {
        query: 'cql.allRecords=1 sortby group',
        limit: '2000',
      },
      records: 'usergroups',
    },
    addressTypes: {
      type: 'okapi',
      path: 'addresstypes',
      params: {
        query: 'cql.allRecords=1 sortby addressType',
        limit: '2000',
      },
      records: 'addressTypes',
    },
    departments: {
      type: 'okapi',
      path: `departments?query=cql.allRecords=1 sortby name&limit=${MAX_RECORDS}`,
      records: 'departments',
    },
    feefineactions: {
      type: 'okapi',
      records: 'feefineactions',
      path: `feefineactions?query=(userId==:{id})&limit=${MAX_RECORDS}`,
    },
    accounts: {
      type: 'okapi',
      records: 'accounts',
      path: `accounts?query=(userId==:{id})&limit=${MAX_RECORDS}`,
    },
    loanRecords: {
      type: 'okapi',
      records: 'loans',
      path: 'circulation/loans?query=(userId==:{id})&limit=1000',
    },
    uniquenessValidator: {
      type: 'okapi',
      records: 'users',
      accumulate: 'true',
      path: 'users',
      fetch: false,
    },
    records: {
      type: 'okapi',
      records: 'users',
      path: 'users',
      fetch: false,
    },
    creds: {
      type: 'okapi',
      path: 'authn/credentials',
      fetch: false,
    },
    perms: {
      type: 'okapi',
      throwErrors: false,
      POST: {
        path: 'perms/users',
      },
      path: 'perms/users/:{id}',
      params: { full: 'true', indexField: 'userId' },
    },
    // NOTE: 'indexField', used as a parameter in the userPermissions paths,
    // modifies the API call so that the :{userid} parameter is actually
    // interpreted as a user ID. By default, that path component is taken as
    // the ID of the user/permission _object_ in /perms/users.
    permissions: {
      type: 'okapi',
      records: 'permissionNames',
      throwErrors: false,
      DELETE: {
        pk: 'permissionName',
        path: 'perms/users/:{id}/permissions',
        params: { indexField: 'userId' },
      },
      GET: {
        path: 'perms/users/:{id}/permissions',
        params: { full: 'true', indexField: 'userId' },
      },
      PUT: {
        path: 'perms/users/%{permUserId}',
      },
      path: 'perms/users/:{id}/permissions',
      params: { indexField: 'userId' },
    },
    settings: {
      type: 'okapi',
      records: 'configs',
      path: 'configurations/entries?query=(module==USERS and configName==profile_pictures)',
    },
    requestPreferences: {
      type: 'okapi',
      throwErrors: false,
      GET: {
        path: 'request-preference-storage/request-preference',
        params: {
          query: 'userId==:{id}'
        }
      },
      POST: {
        path: 'request-preference-storage/request-preference',
      },
      PUT: {
        path: (queryParams, pathComponents, resourceData) => {
          return `request-preference-storage/request-preference/${resourceData.request_preferences.records[0].requestPreferences[0].id}`;
        },
      }
    },
  });

  static propTypes = {
    stripes: PropTypes.shape({
      hasPerm: PropTypes.func.isRequired,
      connect: PropTypes.func.isRequired,
      locale: PropTypes.string.isRequired,
      logger: PropTypes.shape({
        log: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
    resources: PropTypes.shape({
      selUser: PropTypes.object,
      addressTypes: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      departments: PropTypes.shape({
        records: departmentsShape,
      }),
      permissions: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      perms: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      query: PropTypes.object,
      patronGroups: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      settings: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      loansHistory: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      feefineactions: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object).isRequired,
      }).isRequired,
      accounts: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object).isRequired,
      }).isRequired,
      loanRecords: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object).isRequired,
      }).isRequired,
    }),
    mutator: PropTypes.shape({
      selUser: PropTypes.shape({
        PUT: PropTypes.func.isRequired,
      }),
      permissions: PropTypes.shape({
        PUT: PropTypes.func.isRequired,
        DELETE: PropTypes.func.isRequired,
      }),
      perms: PropTypes.shape({
        POST: PropTypes.func.isRequired,
      }),
      uniquenessValidator: PropTypes.shape({
        reset: PropTypes.func.isRequired,
        GET: PropTypes.func.isRequired,
      }).isRequired,
      query: PropTypes.object.isRequired,
    }),
    match: PropTypes.shape({
      path: PropTypes.string.isRequired,
      params: PropTypes.shape({
        id: PropTypes.string,
      }),
    }).isRequired,
    tagsToggle: PropTypes.func,
    location: PropTypes.object,
    history: PropTypes.object,
    updateProxies: PropTypes.func,
    updateServicePoints: PropTypes.func,
    updateSponsors: PropTypes.func,
    getSponsors: PropTypes.func,
    getProxies: PropTypes.func,
    getUserServicePoints: PropTypes.func,
    getPreferredServicePoint: PropTypes.func,
    tagsEnabled: PropTypes.bool,
    okapi: PropTypes.object,
    children: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.node,
    ]),
  };

  render() {
    const { children, ...rest } = this.props;
    if (typeof children === 'function') {
      return children({ source: this.source, ...rest });
    }
    return (<UserDetail {...this.props}>{children}</UserDetail>);
  }
}

export default compose(
  stripesConnect,
  withServicePoints,
  withTags,
  withProxy,
)(UserRecordContainer);
