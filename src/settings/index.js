import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { IfPermission } from '@folio/stripes/core';
import {
  Headline,
  NavList,
  NavListItem,
  NavListSection,
  Pane,
  PaneBackLink,
} from '@folio/stripes/components';

import sections from './sections';

export default class Settings extends Component {
  static propTypes = {
    children: PropTypes.node,
    match: PropTypes.object.isRequired,
  };

  render() {
    const { children, match: { path } } = this.props;

    return (
      <>
        <Pane
          defaultWidth="20%"
          paneTitle={
            <Headline tag="h3" margin="none">
              <FormattedMessage id="ui-users.settings.label" />
            </Headline>
          }
          firstMenu={(
            <PaneBackLink to="/settings" />
          )}
        >
          <NavList>
            {sections.map((section, index) => (
              <NavListSection key={index} label={section.label}>
                {section.pages.map(setting => (setting.perm ? (
                  <IfPermission key={setting.route} perm={setting.perm}>
                    <NavListItem to={`${path}/${setting.route}`}>{setting.label}</NavListItem>
                  </IfPermission>
                ) : (
                  <NavListItem key={setting.route} to={`${path}/${setting.route}`}>{setting.label}</NavListItem>
                )))}
              </NavListSection>
            ))}
          </NavList>
        </Pane>
        {children}
      </>
    );
  }
}
