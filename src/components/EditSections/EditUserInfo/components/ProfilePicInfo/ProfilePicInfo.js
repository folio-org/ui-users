import React, { useState } from 'react';

import {
  Button,
  Select,
  TextField,
  Row,
  Col,
  Icon,
  Datepicker,
  Headline,
  Modal,
  ModalFooter,
  Dropdown,
  DropdownMenu,
  NavList,
  NavListSection,
  NavListItem,
} from '@folio/stripes/components';
import { FormattedMessage, injectIntl } from 'react-intl';

const ProfilePicSection = () => {
  const [open, setOpen] = useState(false);

  const onDropdownToggle = () => {
    setOpen(!open);
  };

  const renderMenu = () => (
    <>
      <DropdownMenu data-role="menu">
        <NavList>
          <NavListSection>
            <NavListItem id="local-file">
              <label htmlFor="file-upload">
                <Icon
                  icon="profile"
                  iconPosition="start"
                >
                  <FormattedMessage id="ui-users.information.localFile" />
                </Icon>
                <input id="file-upload" type="file" hidden />
              </label>
            </NavListItem>
            <NavListItem id="external-url">
              <FormattedMessage id="ui-users.information.externalURL" />
            </NavListItem>
          </NavListSection>
        </NavList>
      </DropdownMenu>
    </>
  );

  return (
    <Col xs={2}>
      <div>Profile picture</div>
      <div style={{
        height: '100px',
        width: '100px',
        position: 'relative',
        border: '1px solid grey',
        borderRadius: '4px',
        margin: '2px',
      }}
      />
      <Dropdown
        id="update-dropdown"
        open={open}
        onToggle={onDropdownToggle}
        label={<FormattedMessage id="ui-users.information.update" />}
        renderMenu={renderMenu}
      />
    </Col>
  );
};
export default ProfilePicSection;
