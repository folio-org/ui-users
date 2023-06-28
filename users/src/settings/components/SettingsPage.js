import React, {
  useRef,
  useEffect,
} from 'react';
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

const SettingsPage = ({ sections, path }) => {
  const paneTitleRef = useRef(null);

  useEffect(() => {
    if (paneTitleRef.current) {
      paneTitleRef.current.focus();
    }
  }, []);

  return (
    <Pane
      defaultWidth="20%"
      paneTitle={
        <Headline tag="h2" margin="none">
          <FormattedMessage id="ui-users.settings.label" />
        </Headline>
      }
      firstMenu={<PaneBackLink to="/settings" />}
      paneTitleRef={paneTitleRef}
    >
      <NavList>
        {sections.map((section, index) => {
          const sectionInner = (
            <NavListSection key={index} label={section.label} tag="h3" data-test-settingspage>
              {section.pages.map((setting) => <SectionPageItem setting={setting} path={path} key={setting.route} />)}
            </NavListSection>
          );
          return section.interface ? <IfInterface name={section.interface} key={index}>{sectionInner}</IfInterface> : sectionInner;
        })}
      </NavList>
    </Pane>
  );
};

SettingsPage.propTypes = {
  path: PropTypes.string.isRequired,
  sections: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default SettingsPage;
