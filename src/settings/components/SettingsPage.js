import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { IfInterface } from '@folio/stripes/core';
import {
  Headline,
  NavList,
  NavListSection,
  Pane,
  PaneBackLink,
} from '@folio/stripes/components';

import SectionPageItem from './SectionPageItem';

const SettingsPage = ({ sections, path }) => (
  <Pane
    defaultWidth="20%"
    paneTitle={
      <Headline tag="h3" margin="none">
        <FormattedMessage id="ui-users.settings.label" />
      </Headline>
    }
    firstMenu={<PaneBackLink to="/settings" />}
  >
    <NavList>
      {sections.map((section, index) => {
        const sectionInner = (
          <NavListSection key={index} label={section.label} data-test-settingspage>
            {section.pages.map((setting) => <SectionPageItem setting={setting} path={path} key={setting.route} />)}
          </NavListSection>
        );
        return section.interface ? <IfInterface name={section.interface} key={index}>{sectionInner}</IfInterface> : sectionInner;
      })}
    </NavList>
  </Pane>
);

SettingsPage.propTypes = {
  path: PropTypes.string.isRequired,
  sections: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default SettingsPage;
