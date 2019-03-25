import React from 'react';
import PropTypes from 'prop-types';
import { Modal } from '@folio/stripes/components';

class ShortcutModal extends React.Component {
  static propTypes = {
    commands: PropTypes.arrayOf(PropTypes.object),
    open: PropTypes.bool,
    onClose: PropTypes.func,
  }

  render() {
    const { commands, open, onClose } = this.props;

    return (
      <Modal dismissible closeOnBackgroundClick onClose={onClose} open={open} label="users-module-shortcut keys" id="users-shortcut-modal">
        <ul>
          {
            commands.map((c, i) => (<li key={i}>{c.shortcut}</li>))
          }
        </ul>
      </Modal>
    );
  }
}

export default ShortcutModal;
