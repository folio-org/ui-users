import React, { Component, Fragment } from 'react';
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

export default class UsersSettings extends Component {
  static propTypes = {
    children: PropTypes.node,
  };

  render() {
    const { children } = this.props;

    return (
      <Fragment>
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
            <NavListSection
              label={<FormattedMessage id="ui-users.settings.general" />}
            >
              <IfPermission perm="ui-users.settings.addresstypes">
                <NavListItem to="/settings/users/addresstypes">
                  <FormattedMessage id="ui-users.settings.addressTypes" />
                </NavListItem>
              </IfPermission>
              <IfPermission perm="ui-users.settings.usergroups">
                <NavListItem to="/settings/users/groups">
                  <FormattedMessage id="ui-users.settings.patronGroups" />
                </NavListItem>
              </IfPermission>
              <IfPermission perm="ui-users.editpermsets">
                <NavListItem to="/settings/users/perms">
                  <FormattedMessage id="ui-users.settings.permissionSet" />
                </NavListItem>
              </IfPermission>
              <NavListItem to="/settings/users/profilepictures">
                <FormattedMessage id="ui-users.settings.profilePictures" />
              </NavListItem>
            </NavListSection>
            <NavListSection
              label={<FormattedMessage id="ui-users.settings.feefine" />}
            >
              <IfPermission perm="ui-users.settings.feefine">
                <NavListItem to="/settings/users/comments">
                  <FormattedMessage id="ui-users.settings.commentRequired" />
                </NavListItem>
                <NavListItem to="/settings/users/feefinestable">
                  <FormattedMessage id="ui-users.settings.manualCharges" />
                </NavListItem>
                <NavListItem to="/settings/users/owners">
                  <FormattedMessage id="ui-users.settings.owners" />
                </NavListItem>
                <NavListItem to="/settings/users/payments">
                  <FormattedMessage id="ui-users.settings.paymentMethods" />
                </NavListItem>
                <NavListItem to="/settings/users/refunds">
                  <FormattedMessage id="ui-users.settings.refundReasons" />
                </NavListItem>
                <NavListItem to="/settings/users/waivereasons">
                  <FormattedMessage id="ui-users.settings.waiveReasons" />
                </NavListItem>
              </IfPermission>
            </NavListSection>
          </NavList>
        </Pane>
        {children}
      </Fragment>
    );
  }
}
