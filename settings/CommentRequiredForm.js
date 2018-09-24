import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@folio/stripes/components';
import { Pane } from '@folio/stripes/components';
import stripesForm from '@folio/stripes/form';
import { Field } from 'redux-form';
import { Row, Col } from '@folio/stripes/components';
import { Select } from '@folio/stripes/components';

const Setting = (props) => (
  <div>
    <Row>
      <Col xs>{props.label}</Col>
    </Row>
    <Row>
      <Col xs={1}>
        <Field
          id={props.name}
          name={props.name}
          component={Select}
          dataOptions={[
            { value: true, label: props.stripes.intl.formatMessage({ id: 'ui-users.yes' }) },
            { value: false, label: props.stripes.intl.formatMessage({ id: 'ui-users.no' }) }
          ]}
        />
      </Col>
    </Row>
  </div>
);

Setting.propTypes = {
  stripes: PropTypes.object,
  label: PropTypes.string,
  name: PropTypes.string,
};

class CommentRequiredForm extends React.Component {
  render() {
    const props = this.props;
    const lastMenu = (
      <Button
        type="submit"
        buttonStyle="primary"
        marginBottom0
        disabled={(props.pristine || props.submitting)}
        id="clickable-save-comment"
      >
        Save
      </Button>
    );

    return (
      <form id="require-comment" onSubmit={this.props.handleSubmit}>
        <Pane defaultWidth="fill" paneTitle={this.props.stripes.intl.formatMessage({ id: 'ui-users.comment.title' })} lastMenu={lastMenu}>
          <Setting {...this.props} name="paid" label={this.props.stripes.intl.formatMessage({ id: 'ui-users.comment.paid' })} />
          <Setting {...this.props} name="waived" label={this.props.stripes.intl.formatMessage({ id: 'ui-users.comment.waived' })} />
          <Setting {...this.props} name="refunded" label={this.props.stripes.intl.formatMessage({ id: 'ui-users.comment.refunded' })} />
          <Setting {...this.props} name="transferredManually" label={this.props.stripes.intl.formatMessage({ id: 'ui-users.comment.transferred' })} />
        </Pane>
      </form>
    );
  }
}

CommentRequiredForm.propTypes = {
  stripes: PropTypes.object,
  handleSubmit: PropTypes.func,
};

export default stripesForm({
  form: 'requireComment',
  navigationCheck: true,
  enableReinitialize: true,
  destroyOnUnmount: false,
})(CommentRequiredForm);
