import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { EditCustomFieldsPage } from '@folio/stripes/smart-components';

class EditCustomFields extends Component {
  static propTypes = {
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
    }).isRequired,
  };

  redirectToView = () => {
    this.props.history.push('/settings/users/custom-fields');
  }

  render() {
    return (
      <EditCustomFieldsPage
        backendModuleName="users"
        appIconName="users"
        entityType="user"
        entityTypeTranslationId="ui-users.meta.title"
        redirectToView={this.redirectToView}
      />
    );
  }
}

export default EditCustomFields;
