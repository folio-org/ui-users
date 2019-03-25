import React from 'react';
import PropTypes from 'prop-types';
import { AppContextMenu } from '@folio/stripes/core';
import { NavList, NavListItem, NavListSection, MenuSection } from '@folio/stripes/components';
import packageInfo from '../package';

const UsersContextMenu = ({ shortcutModalToggle }) => (
  <AppContextMenu>
    {(handleToggle) => (
      <NavList>
        <MenuSection id="usersAppMenu" label="Users application menu">
          <NavListItem to={packageInfo.stripes.home} onClick={handleToggle}>Home page</NavListItem>
          <NavListItem to={`/settings${packageInfo.stripes.home}`} onClick={handleToggle}>Settings</NavListItem>
          <NavListItem href="https://wiki.folio.org/display/FOLIOtips/Users" target="_blank" onClick={handleToggle}>Usage tips</NavListItem>
          {/* <NavListItem onClick={() => { shortcutModalToggle(handleToggle); }}>Keyboard shortcuts</NavListItem> */}
        </MenuSection>
      </NavList>
    )}
  </AppContextMenu>
);

UsersContextMenu.propTypes = {
  shortcutModalToggle: PropTypes.func,
};

export default UsersContextMenu;
