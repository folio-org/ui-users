import React from 'react';
import { FormattedMessage } from 'react-intl';

const shortcuts = [
  {
    name: 'new',
    label: (<FormattedMessage id="ui-users.shortcut.createRecord" />),
    shortcut: 'alt+n',
  },
  {
    name: 'edit',
    label: (<FormattedMessage id="ui-users.shortcut.editRecord" />),
    shortcut: 'ctrl+alt+e',
  },
  {
    name: 'save',
    label: (<FormattedMessage id="ui-users.shortcut.saveRecord" />),
    shortcut: 'ctrl+s',
  },
  {
    name: 'expandOrCollapseSection',
    label: (<FormattedMessage id="ui-users.shortcut.expandCollapse" />),
    shortcut: 'spacebar'
  },
  {
    name: 'expandAllSections',
    label: (<FormattedMessage id="ui-users.shortcut.expandAll" />),
    shortcut: 'ctrl+alt+b'
  },
  {
    name: 'collapseAllSections',
    label: (<FormattedMessage id="ui-users.shortcut.collapseAll" />),
    shortcut: 'ctrl+alt+g'
  },
  {
    name: 'search',
    label: (<FormattedMessage id="ui-users.shortcut.goToSearchFilter" />),
    shortcut: 'ctrl+alt+h',
  },
  {
    name: 'closeModal',
    label: (<FormattedMessage id="ui-users.shortcut.closeModal" />),
    shortcut: 'esc'
  },
  {
    name: 'copy',
    label: (<FormattedMessage id="ui-users.shortcut.copy" />),
    shortcut: 'ctrl + c'
  },
  {
    name: 'cut',
    label: (<FormattedMessage id="ui-users.shortcut.cut" />),
    shortcut: 'ctrl + x'
  },
  {
    name: 'paste',
    label: (<FormattedMessage id="ui-users.shortcut.paste" />),
    shortcut: 'ctrl + v'
  },
  {
    name: 'find',
    label: (<FormattedMessage id="ui-users.shortcut.find" />),
    shortcut: 'ctrl + f'
  }
];

export default shortcuts;
