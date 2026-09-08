import React from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
  useIntl,
} from 'react-intl';

import { TitleManager } from '@folio/stripes/core';
import { Settings as SettingsComponent } from '@folio/stripes/smart-components';

import sections from './sections';

const Settings = (props) => {
  const { formatMessage } = useIntl();
  const { stripes } = props;

  // Filter sections and pages based on interface requirements
  // This is necessary because stripes Settings component doesn't support IfInterface
  const filteredSections = sections.map(section => {
    // Filter pages based on interface requirements
    const pages = section.pages.filter(page => {
      // If page has an interface requirement, check if the interface exists
      if (page.interface) {
        return stripes.hasInterface(page.interface);
      }
      // If page has unlessInterface requirement, check if the interface does NOT exist
      if (page.unlessInterface) {
        return !stripes.hasInterface(page.unlessInterface);
      }
      // No interface requirement, keep the page
      return true;
    });

    return {
      ...section,
      pages,
    };
  }).filter(section => {
    // Filter out sections that have no pages after page filtering
    // or sections that have interface requirements that aren't met
    if (section.pages.length === 0) {
      return false;
    }
    if (section.interface) {
      return stripes.hasInterface(section.interface);
    }
    return true;
  });

  return (
    <TitleManager page={formatMessage({ id: 'ui-users.settings.users.title' })}>
      <SettingsComponent
        {...props}
        sections={filteredSections}
        paneTitle={<FormattedMessage id="ui-users.settings.label" />}
        paneBackLink="/settings"
      />
    </TitleManager>
  );
};

Settings.propTypes = {
  match: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  stripes: PropTypes.object.isRequired,
};

export default Settings;
