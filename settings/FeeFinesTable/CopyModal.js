import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Field, reduxForm } from 'redux-form';

import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import Button from '@folio/stripes-components/lib/Button';
import Select from '@folio/stripes-components/lib/Select';
import RadioButton from '@folio/stripes-components/lib/RadioButton';
import Modal from '@folio/stripes-components/lib/Modal';
import RadioButtonGroup from '@folio/stripes-components/lib/RadioButtonGroup';

const validate = (type, props) => {
  const errors = {};
  if (!type.ownerId && type.option === 'true') {
    errors.ownerId = props.stripes.intl.formatMessage({ id: 'ui-users.feefines.modal.error' });
  }
  if (!type.option) {
    type.option = 'true';
  }
  return errors;
};

class CopyForm extends React.Component {
  static propTypes = {
    stripes: PropTypes.shape({
      intl: PropTypes.object,
    }),
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
      if (o.owner !== 'Shared') options.push({ label: o.owner, value: o.id });
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
                label={this.props.stripes.intl.formatMessage({ id: 'ui-users.feefines.modal.yes' })}
                id="yes"
                value="true"
                checked={this.state.option}
                onChange={this.handleOption}
              />
              <RadioButton
                label={this.props.stripes.intl.formatMessage({ id: 'ui-users.feefines.modal.no' })}
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
              placeholder={this.props.stripes.intl.formatMessage({ id: 'ui-users.feefines.modal.placeholder' })}
            />
          </Col>
        </Row>
        <Button onClick={this.props.handleSubmit}><FormattedMessage id="ui-users.feefines.modal.submit" /></Button>
        <Button onClick={this.props.onClose}><FormattedMessage id="ui-users.feefines.modal.cancel" /></Button>
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
    label={props.stripes.intl.formatMessage({ id: 'ui-users.feefines.modal.title' })}
    size="small"
    onClose={props.onCloseModal}
  >
    <CopyFeeFines
      {...props}
      onClose={props.onCloseModal}
      onSubmit={(type) => { props.onCopyFeeFines(type); }}
      owners={props.ownerList}
    />
  </Modal>
);

CopyModal.propTypes = {
  stripes: PropTypes.shape({
    intl: PropTypes.object,
  }),
  ownerList: PropTypes.arrayOf(PropTypes.object),
  onCloseModal: PropTypes.func,
  openModal: PropTypes.bool,
  onCopyFeeFines: PropTypes.func,
};

export default CopyModal;
