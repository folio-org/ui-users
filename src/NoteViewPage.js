import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactRouterPropTypes from 'react-router-prop-types';

import { NoteViewPage } from '@folio/stripes/smart-components';

class NoteViewRoute extends Component {
  static propTypes = {
    history: ReactRouterPropTypes.history.isRequired,
    location: ReactRouterPropTypes.location.isRequired,
    match: PropTypes.shape({
      params: PropTypes.shape({
        noteId: PropTypes.string.isRequired,
      }).isRequired,
    }).isRequired,
  };

  onEdit = () => {
    const {
      history,
      location,
      match,
    } = this.props;

    history.replace({
      pathname: `/users/notes/${match.params.id}/edit/`,
      state: location.state,
    });
  };

  navigateBack = () => {
    const {
      history,
      location,
    } = this.props;

    if (location.state) {
      history.goBack();
    } else {
      history.push({
        pathname: '/users',
      });
    }
  };

  render() {
    const {
      match,
      location: { state },
    } = this.props;

    const { id } = match.params;
    const referredRecordData = {
      name: state.entityName,
      type: state.entityType,
      id: state.entityId,
    };


    return (
      <NoteViewPage
        entityTypeTranslationKeys={{ user: 'ui-users.user' }}
        entityTypePluralizedTranslationKeys={{ user: 'ui-users.user.pluralized' }}
        navigateBack={this.navigateBack}
        onEdit={this.onEdit}
        paneHeaderAppIcon="users"
        referredEntityData={referredRecordData}
        noteId={id}
      />
    );
  }
}

export default NoteViewRoute;
