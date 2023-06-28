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

  navigateBack = () => {
    const {
      location: { state },
      history,
    } = this.props;

    const path = state?.entityId ? `/users/preview/${state.entityId}` : '/users';

    history.push(path);
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
        navigateBack={this.navigateBack}
        noteId={noteId}
        showDisplayAsPopupOptions
      />
    );
  }
}
