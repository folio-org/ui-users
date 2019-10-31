import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactRouterPropTypes from 'react-router-prop-types';

import { NoteEditPage } from '@folio/stripes/smart-components';

import { retrieveNoteReferredEntityDataFromLocationState } from '../../components/util';

export default class NoteEditRoute extends Component {
  static propTypes = {
    history: ReactRouterPropTypes.history.isRequired,
    location: ReactRouterPropTypes.location.isRequired,
    match: PropTypes.shape({
      params: PropTypes.shape({
        id: PropTypes.string.isRequired,
      }).isRequired,
    }).isRequired,
  };

  goToNoteView = () => {
    const {
      match,
      history,
      location,
    } = this.props;

    const { id } = match.params;
    const noteViewUrl = `/users/notes/${id}`;

    history.replace({
      pathname: noteViewUrl,
      state: location.state,
    });
  }

  render() {
    const {
      match,
      location: { state },
    } = this.props;

    const noteId = match.params.id;
    const referredEntityData = retrieveNoteReferredEntityDataFromLocationState(state);

    return (
      <NoteEditPage
        referredEntityData={referredEntityData}
        entityTypeTranslationKeys={{ user: 'ui-users.user' }}
        entityTypePluralizedTranslationKeys={{ user: 'ui-users.user.pluralized' }}
        paneHeaderAppIcon="users"
        domain="users"
        navigateBack={this.goToNoteView}
        noteId={noteId}
      />
    );
  }
}
