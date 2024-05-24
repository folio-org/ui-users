import React from 'react';
import PropTypes from 'prop-types';

import sections from './sections';
import SettingsPage from './components/SettingsPage';

const Settings = ({ children, match }) => {
  const { path } = match;

  return (
    <>
      <SettingsPage path={path} sections={sections} />
      {children}
    </>
  );
};

Settings.propTypes = {
  children: PropTypes.node,
  match: PropTypes.object.isRequired,
};

export default Settings;
