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
  viewOnly,
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
          disabled={viewOnly}
        />
      </Col>
    </Row>
  </div>
);

Setting.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string,
  intl: PropTypes.shape({}),
  viewOnly: PropTypes.bool,
};

class CommentRequiredForm extends React.Component {
  render() {
    const {
      pristine,
      submitting,
      handleSubmit,
      viewOnly
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
            label={this.props.intl.formatMessage({ id: 'ui-users.comment.paid' })}
            disabled={viewOnly}
          />
          <Setting
            {...this.props}
            name="waived"
            label={this.props.intl.formatMessage({ id: 'ui-users.comment.waived' })}
            disabled={viewOnly}
          />
          <Setting
            {...this.props}
            name="refunded"
            label={this.props.intl.formatMessage({ id: 'ui-users.comment.refunded' })}
            disabled={viewOnly}
          />
          <Setting
            {...this.props}
            name="transferredManually"
            label={this.props.intl.formatMessage({ id: 'ui-users.comment.transferred' })}
            disabled={viewOnly}
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
  intl: PropTypes.shape({}),
  viewOnly: PropTypes.bool,
};

export default stripesFinalForm({
  navigationCheck: true,
})(CommentRequiredForm);
