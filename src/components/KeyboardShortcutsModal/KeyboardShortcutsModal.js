import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import {
  Button,
  Modal,
  ModalFooter,
  MultiColumnList,
} from '@folio/stripes/components';

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
    let operatingSystem;
    if (platform.includes('Mac')) {
      operatingSystem = 'Mac';
    } else {
      operatingSystem = 'Windows';
    }

    const shortcuts = [
      { action: <FormattedMessage id="ui-users.shortcut.createRecord" />, shortcut: <FormattedMessage id={`ui-users.shortcut.${operatingSystem}.createRecord`} /> },
      { action: <FormattedMessage id="ui-users.shortcut.editRecord" />, shortcut: <FormattedMessage id={`ui-users.shortcut.${operatingSystem}.editRecord`} /> },
      { action: <FormattedMessage id="ui-users.shortcut.saveRecord" />, shortcut: <FormattedMessage id={`ui-users.shortcut.${operatingSystem}.saveRecord`} /> },
      { action: <FormattedMessage id="ui-users.shortcut.expandCollapse" />, shortcut: <FormattedMessage id={`ui-users.shortcut.${operatingSystem}.expandCollapse`} /> },
      { action: <FormattedMessage id="ui-users.shortcut.expandAll" />, shortcut: <FormattedMessage id={`ui-users.shortcut.${operatingSystem}.expandAll`} /> },
      { action: <FormattedMessage id="ui-users.shortcut.collapseAll" />, shortcut: <FormattedMessage id={`ui-users.shortcut.${operatingSystem}.collapseAll`} /> },
      { action: <FormattedMessage id="ui-users.shortcut.goToSearchFilter" />, shortcut: <FormattedMessage id={`ui-users.shortcut.${operatingSystem}.goToSearchFilter`} /> },
      { action: <FormattedMessage id="ui-users.shortcut.closeModal" />, shortcut: <FormattedMessage id={`ui-users.shortcut.${operatingSystem}.closeModal`} /> },
      { action: <FormattedMessage id="ui-users.shortcut.copy" />, shortcut: <FormattedMessage id={`ui-users.shortcut.${operatingSystem}.copy`} /> },
      { action: <FormattedMessage id="ui-users.shortcut.cut" />, shortcut: <FormattedMessage id={`ui-users.shortcut.${operatingSystem}.cut`} /> },
      { action: <FormattedMessage id="ui-users.shortcut.paste" />, shortcut: <FormattedMessage id={`ui-users.shortcut.${operatingSystem}.paste`} /> },
      { action: <FormattedMessage id="ui-users.shortcut.find" />, shortcut: <FormattedMessage id={`ui-users.shortcut.${operatingSystem}.find`} /> },
    ];

    const columnMapping = {
      action: <FormattedMessage id="ui-users.shortcut.action" />,
      shortcut: <FormattedMessage id="ui-users.shortcut.shortcut" />,
    };

    return (
      <Modal
        footer={footer}
        id="keyboard-shortcuts-modal"
        label={<FormattedMessage id="ui-users.appMenu.keyboardShortcuts" />}
        dismissible
        open
        onClose={this.props.onClose}
      >
        <div>
          <MultiColumnList
            columnMapping={columnMapping}
            contentData={shortcuts}
            interactive={false}
          />
        </div>
      </Modal>
    );
  }
}

export default KeyboardShortcutsModal;
