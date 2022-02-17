import _, { get, isEmpty, isNil } from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';

import {
  Accordion,
  ExpandAllButton,
  Pane,
  Paneset,
  Row,
  Col,
  PaneMenu,
  Button,
  PaneHeaderIconButton,
  TextArea,
  Checkbox,
  Datepicker,
  Selection
} from '@folio/stripes/components';
import {
  AppIcon,
  TitleManager
} from '@folio/stripes/core';
import { Field } from 'react-final-form';
import setFieldData from 'final-form-set-field-data';

import stripesFinalForm from '@folio/stripes/final-form';
import { ViewMetaData } from '@folio/stripes/smart-components';
import moment from 'moment';
import {
  FormattedMessage,
} from 'react-intl';
import { getFullName } from '../util';
import UserInfo from '../Accounts/ChargeFeeFine/UserInfo';

import css from './PatronBlockForm.css';

const showValidationErrors = ({
  desc,
  borrowing,
  renewals,
  requests,
  expirationDate,
}) => {
  const errors = {};

  if (!desc) {
    errors.desc = <FormattedMessage id="ui-users.blocks.form.validate.desc" />;
  }
  if (!borrowing && !renewals && !requests) {
    errors.borrowing = ' ';
    errors.renewals = ' ';
    errors.requests = ' ';
  }
  if (expirationDate && moment(moment(expirationDate).endOf('day')).isBefore(moment().endOf('day').add(1, 'days'))) {
    errors.expirationDate = <FormattedMessage id="ui-users.blocks.form.validate.future" />;
  }

  return errors;
};

const BLOCK_TEMPLATE_FIELDS_MAP = {
  'desc': 'blockTemplate.desc',
  'patronMessage': 'blockTemplate.patronMessage',
  'borrowing': 'blockTemplate.borrowing',
  'renewals': 'blockTemplate.renewals',
  'requests': 'blockTemplate.requests',
};

class PatronBlockForm extends React.Component {
  static propTypes = {
    user: PropTypes.object,
    pristine: PropTypes.bool,
    submitting: PropTypes.bool,
    invalid: PropTypes.bool,
    params: PropTypes.object,
    onDeleteItem: PropTypes.func,
    onClose: PropTypes.func,
    handleSubmit: PropTypes.func.isRequired,
    connect: PropTypes.func,
    intl: PropTypes.object.isRequired,
    stripes: PropTypes.object,
    initialValues: PropTypes.object,
    blockTemplates: PropTypes.arrayOf(PropTypes.shape()),
    form: PropTypes.shape({
      batch: PropTypes.func.isRequired,
      change: PropTypes.func.isRequired,
      getRegisteredFields: PropTypes.func.isRequired,
    }).isRequired,
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
            aria-label={ariaLabel}
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
      params,
    } = this.props;

    const submit =
      <Button id="patron-block-save-close" marginBottom0 buttonStyle="primary" type="submit" disabled={pristine || submitting || invalid}>
        { params.patronblockid ? <FormattedMessage id="ui-users.blocks.form.button.save" /> : <FormattedMessage id="ui-users.blocks.form.button.create" />}
      </Button>;
    const del = params.patronblockid ? <Button id="patron-block-delete" marginBottom0 buttonStyle="danger" onClick={this.props.onDeleteItem}><FormattedMessage id="ui-users.blocks.form.button.delete" /></Button> : '';

    return (
      <PaneMenu>
        {del}
        {submit}
      </PaneMenu>
    );
  }

  getBlockTemplatesForSelect = (blockTemplates) => {
    const empty = { label: '', value: null };

    const options = blockTemplates.map(b => (
      {
        value: b.id,
        label: b.code ? `${b.name} (${b.code})` : b.name
      }
    )).sort((a, b) => a.label.localeCompare(b.label));
    return [empty, ...options];
  }

  onChangeTemplate = (id) => {
    const { form: { batch, change, getRegisteredFields }, blockTemplates } = this.props;
    const template = blockTemplates.find(t => t.id === id) || {};
    const code = get(template, 'code', null);

    // if no template is selected, all blockActions are set to true (default behavior when creating a block)
    const blockActions = isEmpty(template);
    batch(() => {
      change('type', 'Manual');
      change('desc', null);
      change('code', code);
      change('staffInformation', null);
      change('patronMessage', null);
      change('expirationDate', null);
      change('borrowing', blockActions);
      change('renewals', blockActions);
      change('requests', blockActions);
    });

    getRegisteredFields()
      .forEach(field => {
        const templateField = BLOCK_TEMPLATE_FIELDS_MAP[field] || field;
        const templateFieldValue = get(template, templateField);
        if (!isNil(templateFieldValue)) {
          change(field, templateFieldValue);
        }
      });
  }

  render() {
    const {
      intl,
      params,
      initialValues,
      handleSubmit,
      user = {},
      blockTemplates = [],
    } = this.props;
    const title = params.patronblockid ? getFullName(user) : intl.formatMessage({ id: 'ui-users.blocks.layer.newBlockTitle' });
    const userD = !params.patronblockid ? <UserInfo user={user} /> : '';


    return (
      <form
        onSubmit={handleSubmit}
        id="patron-block-form"
      >
        <Paneset>
          <Pane
            id="title-patron-block"
            defaultWidth="fill"
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
              <Col xs={6} md={6} lg={3}>
                <div id="patronBlockForm-templateSelection">
                  <Selection
                    dataOptions={this.getBlockTemplatesForSelect(blockTemplates)}
                    label={<FormattedMessage id="ui-users.blocks.form.label.template" />}
                    onChange={this.onChangeTemplate}
                  />
                </div>
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
                  {!_.isEmpty(initialValues) ?
                    <Row>
                      <Col xs={12} sm={10} md={7} lg={5}>
                        <this.connectedViewMetaData metadata={initialValues.metadata} />
                      </Col>
                    </Row> : ''
                }

                  <Row>
                    <Col id="patronBlockForm-desc" xs={12} sm={10} md={7} lg={5}>
                      <Field
                        name="desc"
                        label={<FormattedMessage id="ui-users.blocks.form.label.display" />}
                        component={TextArea}
                        required
                        aria-required="true"
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
                        name="expirationDate"
                        component={Datepicker}
                        dateFormat="YYYY-MM-DD"
                        label={<FormattedMessage id="ui-users.blocks.form.label.date" />}
                        backendDateStandard="YYYY-MM-DD"
                        timeZone="UTC"
                      />
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <div className={css.labelWrapper}><FormattedMessage id="ui-users.blocks.form.label.block" /></div>
                    </Col>
                  </Row>
                  <Row>
                    <Col id="patronBlockForm-borrowing" xs={12} sm={10} md={7} lg={5}>
                      <Field
                        name="borrowing"
                        label={<FormattedMessage id="ui-users.blocks.form.label.borrowing" />}
                        component={Checkbox}
                        type="checkbox"
                      />
                    </Col>
                  </Row>
                  <Row>
                    <Col id="patronBlockForm-renewals" xs={12} sm={10} md={7} lg={5}>
                      <Field
                        name="renewals"
                        label={<FormattedMessage id="ui-users.blocks.form.label.renewals" />}
                        component={Checkbox}
                        type="checkbox"
                      />
                    </Col>
                  </Row>
                  <Row>
                    <Col id="patronBlockForm-requests" xs={12} sm={10} md={7} lg={5}>
                      <Field
                        name="requests"
                        label={<FormattedMessage id="ui-users.blocks.form.label.requests" />}
                        component={Checkbox}
                        type="checkbox"
                      />
                    </Col>
                  </Row>
                </Accordion>
              </Col>
            </Row>
          </Pane>
        </Paneset>
      </form>
    );
  }
}

export default stripesFinalForm({
  initialValuesEqual: (a, b) => _.isEqual(a, b),
  navigationCheck: true,
  subscription: {
    invalid: true,
    values: true,
  },
  mutators: { setFieldData },
  validate: showValidationErrors,
})(PatronBlockForm);
