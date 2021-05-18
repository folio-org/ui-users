import React from 'react';
import { IfInterface, IfPermission } from '@folio/stripes/core';
import {
  NavListItem,
} from '@folio/stripes/components';

const SectionPageItem = ({ setting, path }) => {
  let sectionItem = (
    <NavListItem to={`${path}/${setting.route}`} data-test-SectionPageItem-NavListItem>
      {setting.label}
    </NavListItem>
  );

  if (setting.interface) {
    sectionItem = (
      <IfInterface name={setting.interface}>
        {sectionItem}
      </IfInterface>
    );
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

export default SectionPageItem;
