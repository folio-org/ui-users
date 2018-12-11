import React from 'react';
import { HasCommand } from './components/Commander';

const withCommand = WrappedComponent => class WithCommandComponent extends React.Component {
  static manifest = WrappedComponent.manifest;

  constructor(props) {
    super(props);

    this.child = React.createRef();
    this.keyboardCommands = [
      {
        name: 'edit',
        handler: () => this.child.current.goToEdit(),
      },
      {
        name: 'collapseAllSections',
        handler: () => this.child.current.collapseAllSections(),
      },
      {
        name: 'expandAllSections',
        handler:  () => this.child.current.expandAllSections(),
      },
    ];
  }

  checkScope = () => {
    return document.getElementById('ModuleContainer').contains(document.activeElement);
  }

  render() {
    return (
      <HasCommand
        commands={this.keyboardCommands}
        display={['new', 'edit', 'search']}
        isWithinScope={this.checkScope}
        scope={document.body}
      >
        <WrappedComponent ref={this.child} {...this.props} />
      </HasCommand>
    );
  }
};

export default withCommand;
