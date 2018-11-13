import React from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
  injectIntl,
  intlShape,
} from 'react-intl';
import { Field, reduxForm } from 'redux-form';

import {
  Row,
  Col,
  Button,
  Select,
  RadioButton,
  Modal,
  RadioButtonGroup,
} from '@folio/stripes/components';

const validate = (type) => {
  const errors = {};

  if (!type.ownerId && type.option === 'true') {
    errors.ownerId = <FormattedMessage id="ui-users.feefines.modal.error" />;
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
    intl: intlShape.isRequired,
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
                label={<FormattedMessage id="ui-users.feefines.modal.yes" />}
                id="yes"
                value="true"
                checked={this.state.option}
                onChange={this.handleOption}
              />
              <RadioButton
                label={<FormattedMessage id="ui-users.feefines.modal.no" />}
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
              placeholder={this.props.intl.formatMessage({ id: 'ui-users.feefines.modal.placeholder' })}
            />
          </Col>
        </Row>
        <Button onClick={this.props.handleSubmit}>
          <FormattedMessage id="ui-users.feefines.modal.submit" />
        </Button>
        <Button onClick={this.props.onClose}>
          <FormattedMessage id="ui-users.feefines.modal.cancel" />
        </Button>
      </form>
    );
  }
}

const CopyFeeFines = reduxForm({
  form: 'copy-fee-fines',
  validate,
  fields: [],
})(injectIntl(CopyForm));

const CopyModal = props => (
  <Modal
    open={props.openModal}
    label={<FormattedMessage id="ui-users.feefines.modal.title" />}
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
  ownerList: PropTypes.arrayOf(PropTypes.object),
  onCloseModal: PropTypes.func,
  openModal: PropTypes.bool,
  onCopyFeeFines: PropTypes.func,
};

export default CopyModal;
