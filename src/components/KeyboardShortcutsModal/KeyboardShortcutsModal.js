import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import {
  Button,
  Modal,
  ModalFooter,
  MultiColumnList,
} from '@folio/stripes/components';

import shortcuts from '../../shortcuts';

class KeyboardShortcutsModal extends React.Component {
  static propTypes = {
    onClose: PropTypes.func.isRequired,
  };

  render() {
    const footer = (
      <ModalFooter>
        <Button
          id="keyboard-shortcuts-modal-close"
          onClick={this.props.onClose}
        >
          <FormattedMessage id="ui-users.blocks.closeButton" />
        </Button>
      </ModalFooter>
    );

    const platform = window.navigator.platform;
    const shortcutsData = [];
    shortcuts.forEach(key => {
      let value = {};

      if (platform.includes('Mac')) {
        value = {
          'action': key.label,
          'shortcut': key.shortcut.replace('ctrl', 'cmd').replace('alt', 'Option'),
        };
      } else {
        value = {
          'action': key.label,
          'shortcut': key.shortcut,
        };
      }
      shortcutsData.push(value);
    });

    const columnMapping = {
      action: <FormattedMessage id="ui-users.shortcut.action" />,
      shortcut: <FormattedMessage id="ui-users.shortcut.shortcut" />,
    };

    return (
      <Modal
        autosize
        dismissible
        footer={footer}
        id="keyboard-shortcuts-modal"
        label={<FormattedMessage id="ui-users.appMenu.keyboardShortcuts" />}
        onClose={this.props.onClose}
        open
      >
        <div>
          <MultiColumnList
            columnMapping={columnMapping}
            contentData={shortcutsData}
            interactive={false}
          />
        </div>
      </Modal>
    );
  }
}

export default KeyboardShortcutsModal;
