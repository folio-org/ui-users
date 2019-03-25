import React from 'react';
import { AppContextMenu } from '@folio/stripes/core';
import { NavList, NavListItem, MenuSection } from '@folio/stripes/components';
import packageInfo from '../package';

const UsersContextMenu = () => (
  <AppContextMenu>
    {(handleToggle) => (
      <NavList>
        <MenuSection id="usersAppMenu" label="Users application menu">
          <NavListItem to={packageInfo.stripes.home} onClick={handleToggle}>Home page</NavListItem>
          <NavListItem to={`/settings${packageInfo.stripes.home}`} onClick={handleToggle}>Settings</NavListItem>
          <NavListItem href="https://wiki.folio.org/display/FOLIOtips/Users" target="_blank" onClick={handleToggle}>Usage tips</NavListItem>
        </MenuSection>
      </NavList>
    )}
  </AppContextMenu>
);

export default UsersContextMenu;
