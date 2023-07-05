// withMarkAsMissing.js is the model for this
import React from 'react';
import { FormattedMessage } from 'react-intl';
import LoanActionDialog from '../LoanActionDialog';
import { loanActionMutators } from '../../constants';

const withAddInfo = WrappedComponent => class withAddInfoComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      addInfoDialogOpen: false,
      loan: null,
      infoType: null,
    };
  }

  openAddInfoDialog = (loan, infoType) => {
    this.setState({
      addInfoDialogOpen: true,
      loan,
      infoType,
    });
  }

  hideAddInfoDialog = () => {
    this.setState({ addInfoDialogOpen: false });
  }

  render() {
    const {
      addInfoDialogOpen,
      loan,
      infoType,
    } = this.state;

    const modalLabel = <FormattedMessage id={`ui-users.loans.addInfo.${infoType}`} />;

    return (
      <>
        <WrappedComponent
          addInfo={this.openAddInfoDialog}
          {...this.props}
        />
        { loan &&
          <LoanActionDialog
            loan={loan}
            itemRequestCount={0}
            loanAction={infoType === 'staff' ? loanActionMutators.ADD_STAFF_INFO : loanActionMutators.ADD_PATRON_INFO}
            modalLabel={modalLabel}
            open={addInfoDialogOpen}
            onClose={this.hideAddInfoDialog}
            confirmTag="ui-users.saveAndClose"
          />
        }
      </>
    );
  }
};

export default withAddInfo;
