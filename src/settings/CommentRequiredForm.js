import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Field } from 'react-final-form';

import {
  Pane,
  Button,
  Row,
  Col,
  Select,
  PaneFooter,
} from '@folio/stripes/components';
import stripesFinalForm from '@folio/stripes/final-form';

const styles = {
  form: {
    height: '100%',
  },
};

const Setting = ({
  name,
  label,
  intl,
}) => (
  <div id={name}>
    <Row>
      <Col xs>{label}</Col>
    </Row>
    <Row>
      <Col sm={1}>
        <Field
          name={name}
          aria-label={label}
          component={Select}
          dataOptions={[
            { value: true, label: intl.formatMessage({ id: 'ui-users.yes' }) },
            { value: false, label: intl.formatMessage({ id: 'ui-users.no' }) }
          ]}
        />
      </Col>
    </Row>
  </div>
);

Setting.propTypes = {
  label: PropTypes.element,
  name: PropTypes.string,
  intl: PropTypes.object,
};

class CommentRequiredForm extends React.Component {
  render() {
    const {
      pristine,
      submitting,
      handleSubmit,
    } = this.props;

    const footer = (
      <PaneFooter
        renderEnd={(
          <Button
            type="submit"
            buttonStyle="primary"
            marginBottom0
            disabled={(pristine || submitting)}
            id="clickable-save-comment"
          >
            <FormattedMessage id="ui-users.comment.save" />
          </Button>
        )}
      />
    );

    return (
      <form
        id="form-require-comment"
        onSubmit={handleSubmit}
        style={styles.form}
      >
        <Pane
          defaultWidth="fill"
          paneTitle={<FormattedMessage id="ui-users.comment.title" />}
          footer={footer}
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
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
};

export default stripesFinalForm({
  navigationCheck: true,
})(CommentRequiredForm);
