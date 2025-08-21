import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';

import { TitleManager } from '@folio/stripes/core';

import sections from './sections';
import SettingsPage from './components/SettingsPage';

const Settings = ({ children, match }) => {
  const { formatMessage } = useIntl();
  const { path } = match;

  return (
    <TitleManager page={formatMessage({ id: 'ui-users.settings.users.title' })}>
      <SettingsPage path={path} sections={sections} />
      {children}
    </TitleManager>
  );
};

Settings.propTypes = {
  children: PropTypes.node,
  match: PropTypes.shape({}).isRequired,
};

export default Settings;
