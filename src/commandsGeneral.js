import React from 'react';
import { FormattedMessage } from 'react-intl';

const commandsGeneral = [
  {
    name: 'expandOrCollapseSection',
    label: (<FormattedMessage id="ui-users.shortcut.expandCollapse" />),
    shortcut: 'spacebar'
  },
  {
    name: 'closeModal',
    label: (<FormattedMessage id="ui-users.shortcut.closeModal" />),
    shortcut: 'esc'
  },
  {
    name: 'copy',
    label: (<FormattedMessage id="ui-users.shortcut.copy" />),
    shortcut: 'mod + c'
  },
  {
    name: 'cut',
    label: (<FormattedMessage id="ui-users.shortcut.cut" />),
    shortcut: 'mod + x'
  },
  {
    name: 'paste',
    label: (<FormattedMessage id="ui-users.shortcut.paste" />),
    shortcut: 'mod + v'
  },
  {
    name: 'find',
    label: (<FormattedMessage id="ui-users.shortcut.find" />),
    shortcut: 'mod + f'
  }
];

export default commandsGeneral;
