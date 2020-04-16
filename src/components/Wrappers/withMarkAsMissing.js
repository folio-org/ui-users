import React from 'react';

import MarkAsMissingDialog from '../MarkAsMissingDialog';

const withMarkAsMissing = WrappedComponent => class withMarkAsMissingComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      markAsMissingDialogOpen: false,
      loan: null,
    };
  }

  openMarkAsMissingDialog = loan => {
    this.setState({
      loan,
      markAsMissingDialogOpen: true,
    });
  }

  hideMarkAsMissingDialog = () => {
    this.setState({ markAsMissingDialogOpen: false });
  }

  render() {
    const {
      markAsMissingDialogOpen,
      loan,
    } = this.state;

    return (
      <>
        <WrappedComponent
          markAsMissing={this.openMarkAsMissingDialog}
          {...this.props}
        />
        { loan &&
          <MarkAsMissingDialog
            loan={loan}
            open={markAsMissingDialogOpen}
            onClose={this.hideMarkAsMissingDialog}
          />
        }
      </>
    );
  }
};

export default withMarkAsMissing;
