import React from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
  injectIntl,
} from 'react-intl';
import { Field } from 'react-final-form';

import {
  Row,
  Col,
  Button,
  Select,
  RadioButton,
  Modal,
  RadioButtonGroup,
} from '@folio/stripes/components';
import stripesFinalForm from '@folio/stripes/final-form';

import { SHARED_OWNER } from '../../constants';
import css from './FeeFinesTable.css';

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
    form: PropTypes.object,
    handleSubmit: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    props.form.initialize({ option: 'true' });
  }

  render() {
    const options = [];

    this.props.owners.forEach((o) => {
      if (o.owner !== SHARED_OWNER) options.push({ label: o.owner, value: o.id });
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
              />
              <RadioButton
                label={<FormattedMessage id="ui-users.feefines.modal.no" />}
                id="no"
                value="false"
              />
            </Field>
          </Col>
          <Col>
            <Field
              className={css.ownerIdField}
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

const CopyFeeFines = stripesFinalForm({
  navigationCheck: false,
  validate,
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
