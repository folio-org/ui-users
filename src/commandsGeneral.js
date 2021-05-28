import React from 'react';
import { FormattedMessage } from 'react-intl';

const commandsGeneral = [
  {
    label: (<FormattedMessage id="ui-users.shortcut.expandCollapse" />),
    shortcut: 'spacebar'
  },
  {
    label: (<FormattedMessage id="ui-users.shortcut.closeModal" />),
    shortcut: 'esc'
  },
  {
    label: (<FormattedMessage id="ui-users.shortcut.copy" />),
    shortcut: 'mod+c'
  },
  {
    label: (<FormattedMessage id="ui-users.shortcut.cut" />),
    shortcut: 'mod+x'
  },
  {
    label: (<FormattedMessage id="ui-users.shortcut.paste" />),
    shortcut: 'mod+v'
  },
  {
    label: (<FormattedMessage id="ui-users.shortcut.find" />),
    shortcut: 'mod+f'
  }
];

export default commandsGeneral;
