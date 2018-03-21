import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import ControlledVocab from '@folio/stripes-smart-components/lib/ControlledVocab';

import { RenderPatronGroupNumberOfUsers } from '../lib/RenderPatronGroup';

function validate(values) {
  const errors = [];
  if (Array.isArray(values.items)) {
    const itemArrayErrors = [];
    values.items.forEach((item, itemIndex) => {
      const itemErrors = {};
      if (!item.group) {
        itemErrors.group = 'Please fill this in to continue';
        itemArrayErrors[itemIndex] = itemErrors;
      }
    });
    if (itemArrayErrors.length) {
      errors.items = itemArrayErrors;
    }
  }
  return errors;
}

class PatronGroupsSettings extends React.Component {
  static propTypes = {
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
    }).isRequired,
    resources: PropTypes.shape({
      usersPerGroup: PropTypes.object,
    }).isRequired,
  };

  static manifest = Object.freeze({
    usersPerGroup: {
      type: 'okapi',
      records: 'users',
      path: 'users?limit=0&facets=patronGroup',
    },
  });

  constructor(props) {
    super(props);
    this.connectedControlledVocab = props.stripes.connect(ControlledVocab);
  }

  render() {
    const actionProps = {
      delete: (item) => {
        const usersPerGroup = (this.props.resources.usersPerGroup || {}).other || {};
        let disableDelete = [];
        if (_.has(usersPerGroup, ['resultInfo', 'facets'])) {
          const groupCounts = _.get(usersPerGroup, ['resultInfo', 'facets', 0, 'facetValues'], []);
          disableDelete = _.map(groupCounts, 'value');
        }
        if (_.includes(disableDelete, item.id)) {
          return {
            disabled: _.includes(disableDelete, item.id),
            title: 'Patron group cannot be deleted when used by one or more users',
          };
        }

        return {};
      },
    };

    const formatter = {
      numberOfObjects: item => (<RenderPatronGroupNumberOfUsers
        item={item}
        usersPerGroup={this.props.resources ? this.props.resources.usersPerGroup : null}
      />),
    };

    return (
      <this.connectedControlledVocab
        {...this.props}
        baseUrl="groups"
        records="usergroups"
        label="Patron Groups"
        labelSingular="Group"
        objectLabel="Users"
        visibleFields={['group', 'desc']}
        columnMapping={{ group: 'Patron Group', desc: 'Description' }}
        actionProps={actionProps}
        formatter={formatter}
        nameKey="group"
        id="patrongroups"
        validate={validate}
      />
    );
  }
}

export default PatronGroupsSettings;
