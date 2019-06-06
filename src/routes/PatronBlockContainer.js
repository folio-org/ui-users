import React from 'react';
import PropTypes from 'prop-types';
import { stripesConnect } from '@folio/stripes/core';
import { PatronBlockLayer } from '../components/PatronBlock';

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
    patronBlocks: {
      type: 'okapi',
      records: 'manualblocks',
      path:'manualblocks',
      // TODO: the use of activerecord here is very confusing.
      // it specifically correspoonds to a userId in the GET query but
      // is set to an item's ID in onUpdateItem and onDeleteItem.
      // that's not wrong, but it's not clear.
      GET: {
        path: 'manualblocks?query=userId==%{activeRecord.blockid-x}',
      },
      PUT: {
        path: 'manualblocks/%{activeRecord.blockid}',
      },
      DELETE: {
        path: 'manualblocks/%{activeRecord.blockid}',
      }
    },
    activeRecord: {},
  });

  static propTypes = {
    mutator: PropTypes.shape({
      patronBlocks: PropTypes.shape({
        POST: PropTypes.func.isRequired,
        PUT: PropTypes.func.isRequired,
        DELETE: PropTypes.func.isRequired
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
      />);
  }
}

export default stripesConnect(PatronBlockContainer);
