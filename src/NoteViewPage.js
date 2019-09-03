import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactRouterPropTypes from 'react-router-prop-types';

import { NoteViewPage } from '@folio/stripes/smart-components';

import { retrieveNoteReferredEntityDataFromLocationState } from './components/util';

class NoteViewRoute extends Component {
  static propTypes = {
    history: ReactRouterPropTypes.history.isRequired,
    location: ReactRouterPropTypes.location.isRequired,
    match: PropTypes.shape({
      params: PropTypes.shape({
        id: PropTypes.string.isRequired,
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
      pathname: `/users/notes/${match.params.id}/edit`,
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

    const noteId = match.params.id;
    const referredEntityData = retrieveNoteReferredEntityDataFromLocationState(state);

    return (
      <NoteViewPage
        entityTypeTranslationKeys={{ user: 'ui-users.user' }}
        entityTypePluralizedTranslationKeys={{ user: 'ui-users.user.pluralized' }}
        navigateBack={this.navigateBack}
        onEdit={this.onEdit}
        paneHeaderAppIcon="users"
        referredEntityData={referredEntityData}
        noteId={noteId}
      />
    );
  }
}

export default NoteViewRoute;
