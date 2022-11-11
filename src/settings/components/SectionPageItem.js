import React from 'react';
import PropTypes from 'prop-types';
import { IfInterface, IfPermission } from '@folio/stripes/core';
import {
  NavListItem,
} from '@folio/stripes/components';

const SectionPageItem = ({ setting, path }) => {
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

  return sectionItem;
};

SectionPageItem.propTypes = {
  path: PropTypes.string,
  setting: PropTypes.shape({
    interface: PropTypes.string,
    label: PropTypes.element,
    perm: PropTypes.string,
    route: PropTypes.string,
  })
};

export default SectionPageItem;
