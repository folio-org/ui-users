import React from 'react';
import PropTypes from 'prop-types';
import { stripesConnect } from '@folio/stripes/core';
import { PatronBlockLayer } from '../components/PatronBlock';
import { MAX_RECORDS } from '../constants';

class PatronBlockContainer extends React.Component {
  static manifest = Object.freeze({
    selUser: {
      type: 'okapi',
      path: 'users/:{id}',
      clear: false,
      shouldRefresh: (resource, action, refresh) => {
        const { path } = action.meta;
        return refresh || (path && path.match(/link/));
      },
    },
    manualPatronBlocks: {
      type: 'okapi',
      records: 'manualblocks',
      path:'manualblocks',
      params: {
        limit: MAX_RECORDS,
        query: 'userId==:{id}',
      },
      PUT: {
        path: 'manualblocks/%{activeRecord.blockid}',
      },
      DELETE: {
        path: 'manualblocks/%{activeRecord.blockid}',
      },
    },
    blockTemplates: {
      type: 'okapi',
      records: 'manualBlockTemplates',
      path:'manual-block-templates',
      params: {
        limit: '100',
      },
    },
    activeRecord: {},
  });

  static propTypes = {
    mutator: PropTypes.shape({
      manualPatronBlocks: PropTypes.shape({
        POST: PropTypes.func.isRequired,
        PUT: PropTypes.func.isRequired,
        DELETE: PropTypes.func.isRequired,
      }),
      activeRecord: PropTypes.object,
    }).isRequired,
    resources: PropTypes.object,
    selectedPatronBlock: PropTypes.object,
    onCancel: PropTypes.func,
    match: PropTypes.object,
    initialValues: PropTypes.object,
    stripes: PropTypes.object,
  };

  getUser = () => {
    const { resources, match: { params: { id } } } = this.props;
    const selUser = (resources.selUser || {}).records || [];

    if (selUser.length === 0 || !id) return null;
    // Logging below shows this DOES sometimes find the wrong record. But why?
    // console.log(`getUser: found ${selUser.length} users, id '${selUser[0].id}' ${selUser[0].id === id ? '==' : '!='} '${id}'`);
    return selUser.find(u => u.id === id);
  }

  render() {
    return (
      <PatronBlockLayer
        user={this.getUser()}
        {...this.props}
      />
    );
  }
}

export default stripesConnect(PatronBlockContainer);
