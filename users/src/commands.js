import React from 'react';
import { FormattedMessage } from 'react-intl';

const commands = [
  {
    name: 'new',
    label: (<FormattedMessage id="ui-users.shortcut.createRecord" />),
    shortcut: 'alt+n',
  },
  {
    name: 'edit',
    label: (<FormattedMessage id="ui-users.shortcut.editRecord" />),
    shortcut: 'mod+alt+e',
  },
  {
    name: 'save',
    label: (<FormattedMessage id="ui-users.shortcut.saveRecord" />),
    shortcut: 'mod+s',
  },
  {
    name: 'expandAllSections',
    label: (<FormattedMessage id="ui-users.shortcut.expandAll" />),
    shortcut: 'mod+alt+b'
  },
  {
    name: 'collapseAllSections',
    label: (<FormattedMessage id="ui-users.shortcut.collapseAll" />),
    shortcut: 'mod+alt+g'
  },
  {
    name: 'search',
    label: (<FormattedMessage id="ui-users.shortcut.goToSearchFilter" />),
    shortcut: 'mod+alt+h',
  },
  {
    name: 'openShortcutModal',
    label: (<FormattedMessage id="ui-users.shortcut.openShortcutModal" />),
    shortcut: 'mod+alt+k',
  }
];

export default commands;
