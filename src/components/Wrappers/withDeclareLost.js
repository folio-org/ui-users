import React from 'react';

import DeclareLostDialog from '../DeclareLostDialog';

const withDeclareLost = WrappedComponent => class WithDeclareLost extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      declareLostDialogOpen: false,
      loan: null,
    };
  }

  declareLost = loan => {
    this.setState({
      loan,
      declareLostDialogOpen: true,
    });
  }

  hideDeclareLostDialog = () => {
    this.setState({ declareLostDialogOpen: false });
  }

  render() {
    const {
      declareLostDialogOpen,
      loan,
    } = this.state;

    return (
      <>
        <WrappedComponent
          declareLost={this.declareLost}
          {...this.props}
        />
        { loan &&
          <DeclareLostDialog
            loan={loan}
            open={declareLostDialogOpen}
            onClose={this.hideDeclareLostDialog}
          />
        }
      </>
    );
  }
};

export default withDeclareLost;
