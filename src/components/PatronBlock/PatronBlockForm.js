import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';

import {
  Accordion,
  ExpandAllButton,
  Pane,
  Row,
  Col,
  PaneMenu,
  Button,
  PaneHeaderIconButton,
  TextArea,
  Checkbox,
  Datepicker
} from '@folio/stripes/components';
import {
  AppIcon,
  TitleManager
} from '@folio/stripes/core';
import { Field } from 'redux-form';
import stripesForm from '@folio/stripes/form';
import { ViewMetaData } from '@folio/stripes/smart-components';
import moment from 'moment';
import {
  FormattedMessage,
  intlShape,
} from 'react-intl';
import { getFullName } from '../../util';
import UserDetails from '../Accounts/ChargeFeeFine/UserDetails';

const validate = (item) => {
  const errors = {};

  if (!item.desc) {
    errors.desc = <FormattedMessage id="ui-users.blocks.form.validate.desc" />;
  }
  if (!item.borrowing && !item.renewals && !item.requests) {
    errors.borrowing = <FormattedMessage id="ui-users.blocks.form.validate.any" />;
    errors.renewals = <FormattedMessage id="ui-users.blocks.form.validate.any" />;
    errors.requests = <FormattedMessage id="ui-users.blocks.form.validate.any" />;
  }
  if (moment(moment(item.expirationDate).format()).isBefore(moment().format())) {
    errors.expirationDate = <FormattedMessage id="ui-users.blocks.form.validate.future" />;
  }

  return errors;
};


class PatronBlockForm extends React.Component {
  static propTypes = {
    user: PropTypes.object,
    pristine: PropTypes.bool,
    submitting: PropTypes.bool,
    invalid: PropTypes.bool,
    selectedItem: PropTypes.object,
    query: PropTypes.object,
    onDeleteItem: PropTypes.func,
    onClose: PropTypes.func,
    handleSubmit: PropTypes.func.isRequired,
    connect: PropTypes.func,
    intl: intlShape.isRequired,
    stripes: PropTypes.object,
    initialValues: PropTypes.object,
  };

  constructor(props) {
    super(props);

    this.handleExpandAll = this.handleExpandAll.bind(this);
    this.handleSectionToggle = this.handleSectionToggle.bind(this);
    this.connectedViewMetaData = props.stripes.connect(ViewMetaData);

    this.state = {
      sections: {
        blockInformationSection: true,
        blockActionsSection: true,
        prueba: true,
      },
    };
  }

  handleSectionToggle({ id }) {
    this.setState((curState) => {
      const newState = _.cloneDeep(curState);
      newState.sections[id] = !newState.sections[id];
      return newState;
    });
  }

  handleExpandAll(obj) {
    this.setState((curState) => {
      const newState = _.cloneDeep(curState);
      newState.sections = obj;
      return newState;
    });
  }

  renderFirstMenu = () => (
    <PaneMenu>
      <FormattedMessage id="ui-users.blocks.form.button.close">
        {ariaLabel => (
          <PaneHeaderIconButton
            id="close-patron-block"
            onClick={this.props.onClose}
            ariaLabel={ariaLabel}
            icon="times"
          />
        )}
      </FormattedMessage>
    </PaneMenu>
  );

  renderLastMenu = () => {
    const {
      pristine,
      submitting,
      invalid,
      query,
      handleSubmit,
      onDeleteItem,
    } = this.props;

    const submit =
      <Button id="patron-block-save-close" marginBottom0 buttonStyle="primary" onClick={handleSubmit} disabled={pristine || submitting || invalid}>
        {(query.layer === 'edit-block') ? <FormattedMessage id="ui-users.blocks.form.button.save" /> : <FormattedMessage id="ui-users.blocks.form.button.create" />}
      </Button>;
    const del = (query.layer === 'edit-block') ? <Button id="patron-block-delete" marginBottom0 buttonStyle="danger" onClick={onDeleteItem}><FormattedMessage id="ui-users.blocks.form.button.delete" /></Button> : '';

    return (
      <PaneMenu>
        {del}
        {submit}
      </PaneMenu>
    );
  }

  render() {
    const {
      intl,
      initialValues,
      selectedItem,
      query,
      user = {},
    } = this.props;
    const title = query.layer === 'edit-block' ? getFullName(user) : intl.formatMessage({ id: 'ui-users.blocks.layer.newBlockTitle' });
    const userD = query.layer !== 'edit-block' ? <UserDetails user={user} /> : '';

    console.log('initial values', initialValues);

    return (
      <form id="patron-block-form">
        <Pane
          id="title-patron-block"
          defaultWidth="20%"
          firstMenu={this.renderFirstMenu()}
          lastMenu={this.renderLastMenu()}
          appIcon={<AppIcon app="users" size="small" />}
          paneTitle={title}
        >
          <TitleManager />
          {userD}
          <Row end="xs">
            <Col xs id="collapse-patron-block">
              <ExpandAllButton accordionStatus={this.state.sections} onToggle={this.handleExpandAll} />
            </Col>
          </Row>
          <Row>
            <Col xs>
              <Accordion
                id="blockInformationSection"
                label={<FormattedMessage id="ui-users.blocks.form.label.information" />}
                onToggle={this.handleSectionToggle}
                open={this.state.sections.blockInformationSection}
              >
                {!_.isEmpty(selectedItem) ?
                  <Row>
                    <Col xs={12} sm={10} md={7} lg={5}>
                      <this.connectedViewMetaData metadata={selectedItem.metadata} />
                    </Col>
                  </Row> : ''
              }

                <Row>
                  <Col id="patronBlockForm-desc" xs={12} sm={10} md={7} lg={5}>
                    <Field
                      name="desc"
                      label={<FormattedMessage id="ui-users.blocks.form.label.display" />}
                      component={TextArea}
                      placeholder={intl.formatMessage({ id: 'ui-users.blocks.form.placeholder.desc' })}
                      fullWidth
                    />
                  </Col>
                </Row>
                <Row>
                  <Col id="patronBlockForm-staffInformation" xs={12} sm={10} md={7} lg={5}>
                    <Field
                      name="staffInformation"
                      label={<FormattedMessage id="ui-users.blocks.form.label.staff" />}
                      component={TextArea}
                      placeholder={intl.formatMessage({ id: 'ui-users.blocks.form.placeholder.information' })}
                      fullWidth
                    />
                  </Col>
                </Row>
                <Row>
                  <Col id="patronBlockForm-patronMessage" xs={12} sm={10} md={7} lg={5}>
                    <Field
                      label={<FormattedMessage id="ui-users.blocks.form.label.message" />}
                      name="patronMessage"
                      component={TextArea}
                      placeholder={intl.formatMessage({ id: 'ui-users.blocks.form.placeholder.message' })}
                      fullWidth
                    />
                  </Col>
                </Row>
                <Row>
                  <Col id="patronBlockForm-expirationDate" xs={12} sm={10} md={7} lg={5}>
                    <Field
                      component={Datepicker}
                      dateFormat="YYYY/MM/DD"
                      name="expirationDate"
                      label={<FormattedMessage id="ui-users.blocks.form.label.date" />}
                      timeZone="UTC"
                      useFocus
                    />
                  </Col>
                </Row>
                <Row>
                  <Col><FormattedMessage id="ui-users.blocks.form.label.block" /></Col>
                </Row>
                <Row>
                  <Col id="patronBlockForm-borrowing" xs={12} sm={10} md={7} lg={5}>
                    <Field
                      name="borrowing"
                      checked={initialValues.borrowing}
                      label={<FormattedMessage id="ui-users.blocks.form.label.borrowing" />}
                      component={Checkbox}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col id="patronBlockForm-renewals" xs={12} sm={10} md={7} lg={5}>
                    <Field
                      name="renewals"
                      checked={initialValues.renewals}
                      label={<FormattedMessage id="ui-users.blocks.form.label.renewals" />}
                      component={Checkbox}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col id="patronBlockForm-requests" xs={12} sm={10} md={7} lg={5}>
                    <Field
                      name="requests"
                      checked={initialValues.requests}
                      label={<FormattedMessage id="ui-users.blocks.form.label.request" />}
                      component={Checkbox}
                    />
                  </Col>
                </Row>
              </Accordion>
            </Col>
          </Row>
        </Pane>
      </form>
    );
  }
}

export default stripesForm({
  form: 'patronBlockForm',
  enableReinitialize: false,
  validate,
})(PatronBlockForm);
