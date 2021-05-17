import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { IfInterface, IfPermission } from '@folio/stripes/core';
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

  renderSectionPageItem = (setting) => {
    const {
      match: { path },
    } = this.props;
    let sectionItem = (
      <NavListItem to={`${path}/${setting.route}`}>
        {setting.label}
      </NavListItem>
    );

    if (setting.interface) {
      sectionItem = <IfInterface name={setting.interface}>{sectionItem}</IfInterface>;
    }

    if (setting.perm) {
      sectionItem = (
        <IfPermission key={setting.route} perm={setting.perm}>
          {sectionItem}
        </IfPermission>
      );
    }

    return sectionItem;
  };

  render() {
    const {
      children,
    } = this.props;

    return (
      <>
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
                <NavListSection key={index} label={section.label}>
                  {section.pages.map((setting) => this.renderSectionPageItem(setting))}
                </NavListSection>
              );
              return section.interface ? <IfInterface name={section.interface}>{sectionInner}</IfInterface> : sectionInner;
            })}
          </NavList>
        </Pane>
        {children}
      </>
    );
  }
}
