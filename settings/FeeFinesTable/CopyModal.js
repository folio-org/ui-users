import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form';

import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import Button from '@folio/stripes-components/lib/Button';
import Select from '@folio/stripes-components/lib/Select';
import RadioButton from '@folio/stripes-components/lib/RadioButton';
import Modal from '@folio/stripes-components/lib/Modal';
import RadioButtonGroup from '@folio/stripes-components/lib/RadioButtonGroup';

const validate = (type) => {
  const errors = {};
  if (!type.ownerId && type.option === 'true') {
    errors.ownerId = 'Please select one to continue';
  }
  if (!type.option) {
    type.option = 'true';
  }
  return errors;
};

class CopyForm extends React.Component {
  static propTypes = {
    owners: PropTypes.arrayOf(PropTypes.object),
    onClose: PropTypes.func,
    handleSubmit: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      option: true,
    };
    this.handleOption = this.handleOption.bind(this);
  }

  handleOption(e) {
    const value = (e.target.value === 'true');
    this.setState({
      option: value,
    });
  }

  render() {
    const options = [];
    this.props.owners.forEach((o) => {
      if (o.desc !== 'Shared') options.push({ label: o.desc, value: o.id });
    });
    return (
      <form>
        <Row>
          <Col>
            <Field
              name="option"
              component={RadioButtonGroup}
            >
              <RadioButton
                label="Yes"
                id="yes"
                value="true"
                checked={this.state.option}
                onChange={this.handleOption}
              />
              <RadioButton
                label="No"
                id="no"
                value="false"
                checked={!this.state.option}
                onChange={this.handleOption}
              />
            </Field>
          </Col>
          <Col>
            <Field
              name="ownerId"
              component={Select}
              dataOptions={options}
              placeholder="Select One"
            />
          </Col>
        </Row>
        <Button onClick={this.props.handleSubmit}>Continue</Button>
        <Button onClick={this.props.onClose}>Cancel</Button>
      </form>
    );
  }
}

const CopyFeeFines = reduxForm({
  form: 'copy-fee-fines',
  validate,
  fields: [],
})(CopyForm);

const CopyModal = props => (
  <Modal
    open={props.openModal}
    label="Copy existing fee/fine owner table entries?"
    size="small"
    onClose={props.onCloseModal}
  >
    <CopyFeeFines
      onClose={props.onCloseModal}
      onSubmit={(type) => { props.onCopyFeeFines(type); }}
      owners={props.ownerList}
    />
  </Modal>
);

CopyModal.propTypes = {
  ownerList: PropTypes.arrayOf(PropTypes.object),
  onCloseModal: PropTypes.func,
  openModal: PropTypes.bool,
  onCopyFeeFines: PropTypes.func,
};

export default CopyModal;
