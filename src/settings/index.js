import React from 'react';
import PropTypes from 'prop-types';

import { useStripes } from '@folio/stripes/core';
import sections from './sections';
import SettingsPage from './components/SettingsPage';

const Settings = ({ children, match }) => {
  const { path } = match;
  const stripes = useStripes();

  const [settingsGeneral, ...otherSections] = sections;

  const getSettingSections = () => {
    if (!stripes.hasInterface('roles')) return sections;
    return [{ ...settingsGeneral, pages:settingsGeneral.pages.filter(page => page.route !== 'perms') }, ...otherSections];
  };

  return (
    <>
      <SettingsPage path={path} sections={getSettingSections()} />
      {children}
    </>
  );
};

Settings.propTypes = {
  children: PropTypes.node,
  match: PropTypes.object.isRequired,
};

export default Settings;
