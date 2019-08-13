import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Row,
  Col,
  Select,
} from '@folio/stripes/components';
import { FormattedMessage } from 'react-intl';
import { Field, reduxForm } from 'redux-form';

import css from './ChargeNotice.css';

const Item = ({ edit, value, name, dataOptions }) => {
  return (
    <div id={name}>
      {(edit)
        ? <Field
          name={name}
          component={Select}
          dataOptions={dataOptions}
        />
        : (value || '-')
      }
    </div>
  );
};

Item.propTypes = {
  edit: PropTypes.bool,
  value: PropTypes.string,
  name: PropTypes.string,
  dataOptions: PropTypes.arrayOf(PropTypes.object),
};

class ChargeNotice extends React.Component {
  static propTypes = {
    owner: PropTypes.object,
    initialize: PropTypes.func,
    handleSubmit: PropTypes.func,
    templateCharge: PropTypes.arrayOf(PropTypes.object),
    templateAction: PropTypes.arrayOf(PropTypes.object),
    templates: PropTypes.arrayOf(PropTypes.object),
  };

  constructor(props) {
    super(props);
    this.state = {
      edit: false,
    };
  }

  componentDidUpdate(prevProps) {
    const { owner } = this.props;
    if (!_.isEqual(prevProps.owner, owner)) {
      this.props.initialize({
        defaultChargeNoticeId: owner.defaultChargeNoticeId,
        defaultActionNoticeId: owner.defaultActionNoticeId
      });
    }
  }

  onToggleEdit = () => {
    this.setState((prevState) => {
      if (prevState.edit) {
        this.props.handleSubmit();
      }
      return ({ edit: !prevState.edit });
    });
  }

  onCancel = () => {
    this.setState({ edit: false });
  }

  render() {
    const { edit } = this.state;
    const { templateCharge, templateAction, owner, templates } = this.props;
    const buttonLabel = (edit) ? <FormattedMessage id="ui-users.comment.save" /> : <FormattedMessage id="ui-users.edit" />;
    const buttonAction = this.onToggleEdit;

    const defaultChargeNoticeId = (templates.find(t => t.id === owner.defaultChargeNoticeId) || {}).name;
    const defaultActionNoticeId = (templates.find(t => t.id === owner.defaultActionNoticeId) || {}).name;

    return (
      <form>
        <Row>
          <Col xs={4}>
            <div className={css.customCol}>
              <FormattedMessage id="ui-users.feefines.defaultChargeNotice" />
            </div>
          </Col>
          <Col xs={4} className={css.customCol}>
            <FormattedMessage id="ui-users.feefines.defaultActionNotice" />
          </Col>
        </Row>
        <Row>
          <Col xs={4}>
            <Item
              name="defaultChargeNoticeId"
              dataOptions={templateCharge}
              value={defaultChargeNoticeId}
              edit={edit}
            />
          </Col>
          <Col xs={4}>
            <Item
              name="defaultActionNoticeId"
              dataOptions={templateAction}
              value={defaultActionNoticeId}
              edit={edit}
            />
          </Col>
          <Col xs={4}>
            <Button id="charge-notice-primary" onClick={buttonAction}>{buttonLabel}</Button>
            {edit &&
              <Button id="charge-notice-cancel" onClick={this.onCancel}><FormattedMessage id="ui-users.cancel" /></Button>
            }
          </Col>
        </Row>
      </form>
    );
  }
}

export default reduxForm({
  form: 'charge-notice'
})(ChargeNotice);
