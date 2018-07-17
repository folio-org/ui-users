import React from 'react';
import PropTypes from 'prop-types';

import Checkbox from '@folio/stripes-components/lib/Checkbox';
import Modal from '@folio/stripes-components/lib/Modal';
import ModalFooter from '@folio/stripes-components/lib/ModalFooter';
import MultiColumnList from '@folio/stripes-components/lib/MultiColumnList';


class AddServicePointModal extends React.Component {
  static propTypes = {
    onSave: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    stripes: PropTypes.shape({
      intl: PropTypes.shape({
        formatMessage: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
    servicePoints: PropTypes.arrayOf(PropTypes.object),
  }

  state = {
    selection: {},
  }

  static getDerivedStateFromProps(props, state) {
    if (props.servicePoints.length !== Object.values(state.selection).length) {
      const selection = {};

      props.servicePoints.forEach((sp) => { selection[sp.id] = false; });

      return { selection };
    }

    return null;
  }

  onSaveAndClose = () => {
    const servicePoints = this.props.servicePoints.filter(sp => this.state.selection[sp.id]);

    this.props.onSave(servicePoints);
    this.props.onClose();
  }

  onCancel = () => {
    this.props.onClose();
  }

  onToggleBulkSelection = () => {
    const select = Object.values(this.state.selection).includes(false);
    const selection = {};

    this.props.servicePoints.forEach((sp) => { selection[sp.id] = select; });

    this.setState({ selection });
  }

  onToggleSelection = (sp) => {
    const selection = {
      ...this.state.selection,
    };

    selection[sp.id] = !(selection[sp.id]);

    this.setState({ selection });
  }

  renderModalFooter() {
    const { formatMessage } = this.props.stripes.intl;
    return (
      <ModalFooter
        primaryButton={{
          label: formatMessage({ id: 'ui-users.saveAndClose' }),
          onClick: this.onSaveAndClose,
        }}
        secondaryButton={{
          label: formatMessage({ id: 'stripes-core.button.cancel' }),
          onClick: this.onCancel,
        }}
      />
    );
  }

  render() {
    const { formatMessage } = this.props.stripes.intl;

    return (
      <Modal
        footer={this.renderModalFooter()}
        open={this.props.open}
        onClose={this.props.onClose}
        dismissible
        title={formatMessage({ id: 'ui-users.sp.addServicePoints' })}
      >
        <MultiColumnList
          interactive={false}
          contentData={this.props.servicePoints}
          visibleColumns={['selected', 'name']}
          columnMapping={{
            selected: (
              <Checkbox
                name="selected-all"
                checked={Object.values(this.state.selection).includes(false) !== true}
                onChange={this.onToggleBulkSelection}
              />
            ),
            name: formatMessage({ id: 'ui-users.sp.column.name' }),
          }}
          formatter={{
            selected: sp => <Checkbox
              name={`selected-${sp.id}`}
              checked={!!(this.state.selection[sp.id])}
              onChange={() => this.onToggleSelection(sp)}
            />
          }}
        />
      </Modal>
    );
  }
}

export default AddServicePointModal;
