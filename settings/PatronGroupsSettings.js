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
    const formatter = {
      numberOfObjects: item => (<RenderPatronGroupNumberOfUsers
        item={item}
        usersPerGroup={this.props.resources ? this.props.resources.usersPerGroup : null}
      />),
    };

    return (
      <this.connectedControlledVocab
        {...this.props}
        // We have to unset the dataKey to prevent the props.resources in
        // <ControlledVocab> from being overwritten by the props.resources here.
        dataKey={undefined}
        baseUrl="groups"
        records="usergroups"
        label="Patron Groups"
<<<<<<< HEAD
        labelSingular="Patron Group"
=======
        labelSingular="Group"
>>>>>>> 9c970b2037817784bb08820a786655d5843c0c3b
        objectLabel="Users"
        visibleFields={['group', 'desc']}
        columnMapping={{ group: 'Patron Group', desc: 'Description' }}
        formatter={formatter}
        nameKey="group"
        id="patrongroups"
        validate={validate}
      />
    );
  }
}

export default PatronGroupsSettings;
