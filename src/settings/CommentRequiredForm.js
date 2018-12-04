import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Field } from 'redux-form';

import {
  Pane,
  Button,
  Row,
  Col,
  Select,
} from '@folio/stripes/components';
import stripesForm from '@folio/stripes/form';

const Setting = ({
  name,
  label,
}) => (
  <div>
    <Row>
      <Col xs>{label}</Col>
    </Row>
    <Row>
      <Col sm={1}>
        <Field
          id={name}
          name={name}
          component={Select}
        >
          <FormattedMessage id="ui-users.yes">
            {(message) => <option value="true">{message}</option>}
          </FormattedMessage>
          <FormattedMessage id="ui-users.no">
            {(message) => <option value="false">{message}</option>}
          </FormattedMessage>
        </Field>
      </Col>
    </Row>
  </div>
);

Setting.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string,
};

class CommentRequiredForm extends React.Component {
  render() {
    const {
      pristine,
      submitting,
      handleSubmit,
    } = this.props;

    const lastMenu = (
      <Button
        type="submit"
        buttonStyle="primary"
        marginBottom0
        disabled={(pristine || submitting)}
        id="clickable-save-comment"
      >
        <FormattedMessage id="ui-users.comment.save" />
      </Button>
    );

    return (
      <form
        id="require-comment"
        onSubmit={handleSubmit}
      >
        <Pane
          defaultWidth="fill"
          paneTitle={<FormattedMessage id="ui-users.comment.title" />}
          lastMenu={lastMenu}
        >
          <Setting
            {...this.props}
            name="paid"
            label={<FormattedMessage id="ui-users.comment.paid" />}
          />
          <Setting
            {...this.props}
            name="waived"
            label={<FormattedMessage id="ui-users.comment.waived" />}
          />
          <Setting
            {...this.props}
            name="refunded"
            label={<FormattedMessage id="ui-users.comment.refunded" />}
          />
          <Setting
            {...this.props}
            name="transferredManually"
            label={<FormattedMessage id="ui-users.comment.transferred" />}
          />
        </Pane>
      </form>
    );
  }
}

CommentRequiredForm.propTypes = {
  handleSubmit: PropTypes.func,
};

export default stripesForm({
  form: 'requireComment',
  navigationCheck: true,
  enableReinitialize: true,
  destroyOnUnmount: false,
})(CommentRequiredForm);
