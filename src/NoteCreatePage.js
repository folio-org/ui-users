import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactRouterPropTypes from 'react-router-prop-types';
import { Redirect } from 'react-router-dom';

import { NoteCreatePage } from '@folio/stripes/smart-components';

import { retrieveNoteReferredEntityDataFromLocationState } from './util';

export default class NoteCreateRoute extends Component {
  static propTypes = {
    history: PropTypes.shape({
      goBack: PropTypes.func.isRequired,
    }).isRequired,
    location: ReactRouterPropTypes.location.isRequired,
  };

  renderCreatePage() {
    const {
      history,
      location: { state },
    } = this.props;

    const referredRecordData = retrieveNoteReferredEntityDataFromLocationState(state);

    return (
      <NoteCreatePage
        referredEntityData={referredRecordData}
        entityTypeTranslationKeys={{ user: 'ui-users.user' }}
        paneHeaderAppIcon="users"
        domain="users"
        navigateBack={history.goBack}
      />
    );
  }

  render() {
    const { location } = this.props;

    return location.state
      ? this.renderCreatePage()
      : <Redirect to="/users" />;
  }
}
