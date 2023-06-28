import React from 'react';
import PropTypes from 'prop-types';

import OverrideModal from './OverrideModal';
import PatronBlockModal from './PatronBlockModal';

class PatronBlockModalWithOverrideModal extends React.Component {
  constructor() {
    super();

    this.state = {
      additionalInfo: '',
      overrideModal: false,
    };
  }

  onSetAdditionalInfo = (value = '') => {
    this.setState({ additionalInfo: value });
  };

  onOpenOverrideModal = () => {
    this.setState({ overrideModal: true });
  };

  onCloseOverrideModal = () => {
    this.setState({ overrideModal: false });
  };

  render() {
    const {
      additionalInfo,
      overrideModal,
    } = this.state;
    const {
      patronBlockedModalOpen,
      viewUserPath,
      patronBlocks,
      onClosePatronBlockedModal,
      onOpenPatronBlockedModal,
      onRenew,
    } = this.props;

    return (
      <>
        <OverrideModal
          open={overrideModal}
          additionalInfo={additionalInfo}
          onSetAdditionalInfo={this.onSetAdditionalInfo}
          onClose={() => {
            this.onCloseOverrideModal();
            onOpenPatronBlockedModal();
          }}
          onSave={async () => {
            this.onCloseOverrideModal();
            this.onSetAdditionalInfo();
            await onRenew(additionalInfo);
          }}
          patronBlocks={patronBlocks}
        />
        <PatronBlockModal
          open={patronBlockedModalOpen}
          onOverride={this.onOpenOverrideModal}
          onClose={onClosePatronBlockedModal}
          patronBlocks={patronBlocks}
          viewUserPath={viewUserPath}
        />
      </>
    );
  }
}

PatronBlockModalWithOverrideModal.propTypes = {
  patronBlockedModalOpen: PropTypes.bool.isRequired,
  viewUserPath: PropTypes.string.isRequired,
  patronBlocks: PropTypes.arrayOf(PropTypes.object).isRequired,
  onClosePatronBlockedModal: PropTypes.func.isRequired,
  onOpenPatronBlockedModal: PropTypes.func.isRequired,
  onRenew: PropTypes.func.isRequired,
};

export default PatronBlockModalWithOverrideModal;
