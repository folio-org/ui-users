import React from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
  injectIntl,
} from 'react-intl';
import {
  MultiColumnList,
  Checkbox,
  Layout,
  Modal,
  Button,
  ModalFooter,
} from '@folio/stripes/components';
import {
  isEqual,
  isEmpty,
  every,
} from 'lodash';

class AddServicePointModal extends React.Component {
  static propTypes = {
    onSave: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    servicePoints: PropTypes.arrayOf(PropTypes.object),
    assignedServicePoints: PropTypes.arrayOf(PropTypes.object),
    intl: PropTypes.object.isRequired,
  }

  state = {
    selection: {},
  }

  static getDerivedStateFromProps(props, state) {
    const assignedServicePointIds = props.assignedServicePoints.map(({ id }) => id);
    const selectionIds = Object.keys(state.selection).filter(id => state.selection[id]);

    if (!isEqual(assignedServicePointIds, selectionIds)) {
      const selection = {};

      props.servicePoints.forEach(({ id }) => {
        selection[id] = assignedServicePointIds.includes(id);
      });

      return { selection: props.open ? { ...selection, ...state.selection } : selection };
    }

    return null;
  }

  onSaveAndClose = () => {
    const {
      servicePoints,
      onSave,
      onClose,
    } = this.props;

    const selectedServicePoints = servicePoints.filter(sp => this.state.selection[sp.id]);

    onSave(selectedServicePoints);
    onClose();
  }

  onCancel = () => {
    this.props.onClose();
  }

  onToggleBulkSelection = () => {
    const select = isEmpty(this.state.selection) || Object.values(this.state.selection).includes(false);
    const selection = {};

    this.props.servicePoints.forEach((sp) => { selection[sp.id] = select; });

    this.setState({ selection });
  }

  onToggleSelection = (sp) => {
    this.setState(({ selection }) => ({
      selection: {
        ...selection,
        [sp.id]: !(selection[sp.id])
      }
    }));
  }

  renderModalFooter() {
    return (
      <ModalFooter>
        <Button
          buttonStyle="primary"
          id="save-service-point-btn"
          onClick={this.onSaveAndClose}
        >
          <FormattedMessage id="ui-users.saveAndClose" />
        </Button>
        <Button
          onClick={this.onCancel}
        >
          <FormattedMessage id="stripes-core.button.cancel" />
        </Button>
      </ModalFooter>
    );
  }

  render() {
    const {
      open,
      onClose,
      intl: { formatMessage },
      servicePoints,
    } = this.props;

    const { selection } = this.state;

    return (
      <Modal
        id="service-points-modal"
        footer={this.renderModalFooter()}
        open={open}
        onClose={onClose}
        dismissible
        label={<FormattedMessage id="ui-users.sp.addServicePoints" />}
      >
        <Layout className="textCentered">
          <FormattedMessage
            id="ui-users.sp.servicePointsFound"
            values={{ count: servicePoints.length }}
          />
        </Layout>
        <MultiColumnList
          interactive={false}
          contentData={servicePoints}
          visibleColumns={['selected', 'name']}
          columnMapping={{
            selected: (
              <Checkbox
                data-test-sp-modal-checkbox="select-all"
                aria-label={formatMessage({ id: 'ui-users.sp.selectAllServicePoints' })}
                name="selected-all"
                checked={!isEmpty(selection) && every(selection, el => el === true)}
                onChange={this.onToggleBulkSelection}
              />
            ),
            name: formatMessage({ id: 'ui-users.sp.column.name' }),
          }}
          columnWidths={{ selected: 35 }}
          formatter={{
            selected: sp => <Checkbox
              data-test-sp-modal-checkbox={sp.id}
              aria-label={`checkbox-${sp.id}`}
              name={`selected-${sp.id}`}
              checked={selection[sp.id]}
              onChange={() => this.onToggleSelection(sp)}
            />
          }}
        />
      </Modal>
    );
  }
}

export default injectIntl(AddServicePointModal);
