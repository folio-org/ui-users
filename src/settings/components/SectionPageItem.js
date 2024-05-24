import React from 'react';
import PropTypes from 'prop-types';
import { IfInterface, IfPermission } from '@folio/stripes/core';
import {
  NavListItem,
} from '@folio/stripes/components';

const SectionPageItem = ({ setting, path, hasInterface }) => {
  let sectionItem = (
    <NavListItem to={`${path}/${setting.route}`} data-test-sectionpageitem>
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

  if (hasInterface(setting?.dependsOnNoneInterface)) {
    return null;
  }

  return sectionItem;
};

SectionPageItem.propTypes = {
  path: PropTypes.string,
  setting: PropTypes.shape({
    interface: PropTypes.string,
    label: PropTypes.element,
    perm: PropTypes.string,
    route: PropTypes.string,
    dependsOnNoneInterface: PropTypes.string
  }),
  hasInterface: PropTypes.func
};

export default SectionPageItem;
