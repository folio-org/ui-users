import { upperFirst } from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import {
  Button,
  Modal,
  ModalFooter,
  MultiColumnList,
} from '@folio/stripes/components';

import commands from '../../commands';
import commandsGeneral from '../../commandsGeneral';

function KeyboardShortcutsModal(props) {
  const { onClose } = props;

  const footer = (
    <ModalFooter>
      <Button
        id="keyboard-shortcuts-modal-close"
        onClick={onClose}
      >
        <FormattedMessage id="ui-users.blocks.closeButton" />
      </Button>
    </ModalFooter>
  );

  const allCommands = commands.concat(commandsGeneral);
  const platform = window.navigator.platform;
  const shortcutsData = [];
  allCommands.forEach(key => {
    let value = {};

    if (platform.includes('Mac')) {
      value = {
        'action': key.label,
        'shortcut': upperFirst(key.shortcut.replace('mod', 'cmd').replace('alt', 'Option')),
      };
    } else {
      value = {
        'action': key.label,
        'shortcut': upperFirst(key.shortcut.replace('mod', 'ctrl')),
      };
    }
    shortcutsData.push(value);
  });

  const columnMapping = {
    action: <FormattedMessage id="ui-users.shortcut.action" />,
    shortcut: <FormattedMessage id="ui-users.shortcut.shortcut" />,
  };

  const columnWidths = {
    'action': '50%',
    'shortcut': '50%',
  };

  return (
    <Modal
      autosize
      dismissible
      footer={footer}
      id="keyboard-shortcuts-modal"
      label={<FormattedMessage id="ui-users.appMenu.keyboardShortcuts" />}
      onClose={onClose}
      open
    >
      <div>
        <MultiColumnList
          columnMapping={columnMapping}
          columnWidths={columnWidths}
          contentData={shortcutsData}
          interactive={false}
        />
      </div>
    </Modal>
  );
}

KeyboardShortcutsModal.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default KeyboardShortcutsModal;
