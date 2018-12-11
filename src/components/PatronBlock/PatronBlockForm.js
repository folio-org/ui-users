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
  IconButton,
  TextArea,
  Checkbox,
  Datepicker,
  AppIcon
} from '@folio/stripes/components';
import { TitleManager } from '@folio/stripes/core';
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
  if (!item.expirationDate) {
    errors.expirationDate = <FormattedMessage id="ui-users.blocks.form.validate.date" />;
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
    initialize: PropTypes.func,
    handleSubmit: PropTypes.func.isRequired,
    connect: PropTypes.func,
    intl: intlShape.isRequired,
    readOnly: PropTypes.bool,
    stripes: PropTypes.object,
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
      borrowing: false,
      renewals: false,
      requests: false,
      checkedBlocks: {},
    };
  }

  componentDidMount() {
    const item = this.props.selectedItem || {};
    const state = {
      borrowing: (item.id) ? item.borrowing : true,
      renewals: (item.id) ? item.renewals : true,
      requests: (item.id) ? item.requests : true,
    };
    this.setState(state);
    this.props.initialize(state);

    if (item.id) {
      this.props.initialize(item);
    }
  }

  componentDidUpdate(prevProps) {
    if (JSON.stringify(prevProps.selectedItem) !== JSON.stringify(this.props.selectedItem)) {
      const item = this.props.selectedItem || {};
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        borrowing: item.borrowing,
        renewals: item.renewals,
        requests: item.requests,
      });
      this.props.initialize(item);
    }
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
      <IconButton
        id="close-patron-block"
        onClick={this.props.onClose}
        title="Close"
        icon="closeX"
      />
    </PaneMenu>
  );

  renderLastMenu = () => {
    const {
      pristine,
      submitting,
      invalid,
      query,
    } = this.props;

    const submit =
      <Button buttonStyle="primary" onClick={this.props.handleSubmit} disabled={pristine || submitting || invalid}>
        {(query.layer === 'edit-block') ? <FormattedMessage id="ui-users.blocks.form.button.save" /> : <FormattedMessage id="ui-users.blocks.form.button.create" />}
      </Button>;
    const del = (query.layer === 'edit-block') ? <Button buttonStyle="danger" onClick={this.props.onDeleteItem}><FormattedMessage id="ui-users.blocks.form.button.delete" /></Button> : '';

    return (
      <PaneMenu>
        {del}
        {submit}
      </PaneMenu>
    );
  }

  onToggleActions = (action) => {
    const { readOnly } = this.props;

    return (e) => {
      if (readOnly) {
        e.preventDefault();
      }
      this.setState(prevState => ({
        [action]: !prevState[action],
      }));
    };
  }

  render() {
    const user = this.props.user || {};
    const { intl } = this.props;
    const title = this.props.query.layer === 'edit-block' ?
      <div>
        {' '}
        <AppIcon app="users" size="small" />
        {getFullName(user)}
        {' '}
      </div> : 'New Block';
    const userD = this.props.query.layer !== 'edit-block' ? <UserDetails user={user} /> : '';

    return (
      <Pane
        defaultWidth="20%"
        firstMenu={this.renderFirstMenu()}
        paneTitle={title}
        lastMenu={this.renderLastMenu()}
      >
        <TitleManager />
        {userD}
        <Row end="xs">
          <Col xs>
            <ExpandAllButton accordionStatus={this.state.sections} onToggle={this.handleExpandAll} />
          </Col>
        </Row>
        <Row>
          <Col xs>
            <Accordion
              label={<FormattedMessage id="ui-users.blocks.form.label.information" />}
              id="blockInformationSection"
              onToggle={this.handleSectionToggle}
              open={this.state.sections.blockInformationSection}
            >
              {(this.props.selectedItem.metadata) ?
                <Row>
                  <Col xs={12} sm={10} md={7} lg={5}>
                    <this.connectedViewMetaData metadata={this.props.selectedItem.metadata} />
                  </Col>
                </Row> : ''
              }
              <form>
                <Row>
                  <Col xs={12} sm={10} md={7} lg={5}>
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
                  <Col xs={12} sm={10} md={7} lg={5}>
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
                  <Col xs={12} sm={10} md={7} lg={5}>
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
                  <Col xs={12} sm={10} md={7} lg={5}>
                    <Field
                      component={Datepicker}
                      dateFormat="YYYY/MM/DD"
                      name="expirationDate"
                      label={<FormattedMessage id="ui-users.blocks.form.label.date" />}
                      backendDateStandard="YYYY/MM/DD"
                      timeZone="UTC"
                      useFocus
                    />
                  </Col>
                </Row>
                <Row>
                  <Col><FormattedMessage id="ui-users.blocks.form.label.block" /></Col>
                </Row>
                <Row>
                  <Col xs={12} sm={10} md={7} lg={5}>
                    <Field
                      name="borrowing"
                      id="borrowing"
                      label={<FormattedMessage id="ui-users.blocks.form.label.borrowing" />}
                      checked={this.state.borrowing}
                      value={this.state.borrowing}
                      onChange={this.onToggleActions('borrowing')}
                      component={Checkbox}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col xs={12} sm={10} md={7} lg={5}>
                    <Field
                      name="renewals"
                      id="renewals"
                      label={<FormattedMessage id="ui-users.blocks.form.label.renewals" />}
                      checked={this.state.renewals}
                      onChange={this.onToggleActions('renewals')}
                      value={this.state.renewals}
                      component={Checkbox}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col xs={12} sm={10} md={7} lg={5}>
                    <Field
                      name="requests"
                      id="requests"
                      label={<FormattedMessage id="ui-users.blocks.form.label.request" />}
                      component={Checkbox}
                      checked={this.state.requests}
                      onChange={this.onToggleActions('requests')}
                      value={this.state.requests}
                    />
                  </Col>
                </Row>
              </form>
            </Accordion>
          </Col>
        </Row>
      </Pane>
    );
  }
}

export default stripesForm({
  form: 'patron-block-form',
  validate,
  fields: [],
})(PatronBlockForm);
