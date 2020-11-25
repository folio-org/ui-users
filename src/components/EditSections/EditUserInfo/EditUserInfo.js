import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { change, Field, formValueSelector, getFormValues } from 'redux-form';
import { FormattedMessage, injectIntl } from 'react-intl';
import moment from 'moment-timezone';

import { ViewMetaData } from '@folio/stripes/smart-components';
import {
  Button,
  Select,
  TextField,
  Row,
  Col,
  Accordion,
  Datepicker,
  Headline,
  Modal,
  ModalFooter,
} from '@folio/stripes/components';

import css from './EditUserInfo.css';

class EditUserInfo extends React.Component {
  static propTypes = {
    accordionId: PropTypes.string.isRequired,
    expanded: PropTypes.bool,
    initialValues: PropTypes.object,
    intl: PropTypes.object.isRequired,
    onToggle: PropTypes.func,
    patronGroups: PropTypes.arrayOf(PropTypes.object),
    selectedPatronGroup: PropTypes.string,
    stripes: PropTypes.shape({
      store: PropTypes.shape({
        dispatch: PropTypes.func.isRequired,
        getState: PropTypes.func,
      }),
    }).isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      showInfoModal: false,
    };
  }

  componentDidUpdate(prevProps) {
    const offsetOfSelectedPatronGroup = this.getPatronGroupOffset();
    if (this.props.selectedPatronGroup !== prevProps.selectedPatronGroup && offsetOfSelectedPatronGroup !== '') {
      this.showModal(true);
    }
  }

  showModal = (val) => {
    this.setState({
      showInfoModal: val,
    });
  }

  handleClose = () => {
    this.setState({ showInfoModal: false });
  }

  recalculateExpirationDate = () => {
    const offsetOfSelectedPatronGroup = this.props.selectedPatronGroup ? this.getPatronGroupOffset() : '';
    const recalculatedDate = (moment().add(offsetOfSelectedPatronGroup, 'd').format('YYYY-MM-DD'));
    this.props.stripes.store.dispatch(change('userForm', 'expirationDate', recalculatedDate));
    this.setState({ showInfoModal: false });
  }

  getPatronGroupOffset = () => {
    const selectedPatronGroup = this.props.patronGroups.find(i => i.id === this.props.selectedPatronGroup);
    const offsetOfSelectedPatronGroup = _.get(selectedPatronGroup, 'expirationOffsetInDays', '');
    return offsetOfSelectedPatronGroup;
  };

  render() {
    const {
      patronGroups,
      initialValues,
      expanded,
      onToggle,
      accordionId,
      intl,
    } = this.props;

    const isUserExpired = () => {
      const expirationDate = new Date(initialValues.expirationDate);
      const now = Date.now();
      return expirationDate <= now;
    };

    const willUserExtend = () => {
      const { store } = this.props.stripes;
      const state = store.getState();
      const formValues = getFormValues('userForm')(state) || {};
      const currentExpirationDate = new Date(_.get(formValues, 'expirationDate', ''));
      const now = Date.now();
      return currentExpirationDate >= now;
    };

    const isStatusFieldDisabled = () => {
      let statusFieldDisabled = false;
      statusFieldDisabled = isUserExpired();
      return statusFieldDisabled;
    };

    const checkShowRecalculateButton = () => {
      let showRecalculateButton = false;
      const offsetOfSelectedPatronGroup = this.props.selectedPatronGroup ? this.getPatronGroupOffset() : '';
      if (offsetOfSelectedPatronGroup === '') {
        showRecalculateButton = false;
      } else {
        showRecalculateButton = true;
      }
      return showRecalculateButton;
    };

    const patronGroupOptions = [
      {
        value: '',
        label: intl.formatMessage({ id: 'ui-users.information.selectPatronGroup' }),
      },
      ...patronGroups.map(g => ({
        key: g.id,
        value: g.id,
        label: g.group.concat(g.desc ? ` (${g.desc})` : ''),
      }))
    ];

    const statusOptions = [
      {
        value: true,
        label: intl.formatMessage({ id: 'ui-users.active' })
      },
      {
        value: false,
        label: intl.formatMessage({ id: 'ui-users.inactive' })
      }
    ];

    const offset = this.getPatronGroupOffset();
    const group = _.get(this.props.patronGroups.find(i => i.id === this.props.selectedPatronGroup), 'group', '');
    const footer = (
      <ModalFooter>
        <Button
          id="expirationDate-modal-recalculate-btn"
          onClick={this.recalculateExpirationDate}
        >
          <FormattedMessage id="ui-users.information.recalculate.expirationDate" />
        </Button>
        <Button
          id="expirationDate-modal-cancel-btn"
          onClick={this.handleClose}
        >
          <FormattedMessage id="ui-users.cancel" />
        </Button>
      </ModalFooter>
    );

    return (
      <>
        <Accordion
          label={<Headline size="large" tag="h3"><FormattedMessage id="ui-users.information.userInformation" /></Headline>}
          open={expanded}
          id={accordionId}
          onToggle={onToggle}
        >

          { initialValues.metadata && <ViewMetaData metadata={initialValues.metadata} /> }

          <Row>
            <Col xs={12} md={3}>
              <Field
                label={<FormattedMessage id="ui-users.information.lastName" />}
                name="personal.lastName"
                id="adduser_lastname"
                component={TextField}
                required
                fullWidth
              />
            </Col>
            <Col xs={12} md={3}>
              <Field
                label={<FormattedMessage id="ui-users.information.firstName" />}
                name="personal.firstName"
                id="adduser_firstname"
                component={TextField}
                fullWidth
              />
            </Col>
            <Col xs={12} md={3}>
              <Field
                label={<FormattedMessage id="ui-users.information.middleName" />}
                name="personal.middleName"
                id="adduser_middlename"
                component={TextField}
                fullWidth
              />
            </Col>
            <Col xs={12} md={3}>
              <Field
                label={<FormattedMessage id="ui-users.information.preferredName" />}
                name="personal.preferredFirstName"
                id="adduser_preferredname"
                component={TextField}
                fullWidth
              />
            </Col>
          </Row>

          <Row>
            <Col xs={12} md={3}>
              <Field
                label={<FormattedMessage id="ui-users.information.patronGroup" />}
                name="patronGroup"
                id="adduser_group"
                component={Select}
                selectClass={css.patronGroup}
                fullWidth
                dataOptions={patronGroupOptions}
                defaultValue={initialValues.patronGroup}
                aria-required="true"
                required
              />
            </Col>
            <Col xs={12} md={3}>
              <Field
                label={<FormattedMessage id="ui-users.information.status" />}
                name="active"
                id="useractive"
                component={Select}
                fullWidth
                disabled={isStatusFieldDisabled()}
                dataOptions={statusOptions}
                defaultValue={initialValues.active}
                aria-required="true"
                required
              />
              {isUserExpired() && (
                <span className={css.expiredMessage}>
                  <FormattedMessage id="ui-users.errors.userExpired" />
                </span>
              )}
              {isUserExpired() && willUserExtend() && (
                <p className={css.expiredMessage} id="saving-will-reactivate-user">
                  <FormattedMessage id="ui-users.information.recalculate.will.reactivate.user" />
                </p>
              )}
            </Col>
            <Col xs={12} md={3}>
              <Field
                component={Datepicker}
                label={<FormattedMessage id="ui-users.expirationDate" />}
                dateFormat="YYYY-MM-DD"
                defaultValue={initialValues.expirationDate}
                name="expirationDate"
                id="adduser_expirationdate"
              />
              {checkShowRecalculateButton() && (
                <Button
                  id="recalculate-expirationDate-btn"
                  onClick={this.recalculateExpirationDate}
                >
                  <FormattedMessage id="ui-users.information.recalculate.expirationDate" />
                </Button>
              )}
            </Col>
            <Col xs={12} md={3}>
              <Field
                label={<FormattedMessage id="ui-users.information.barcode" />}
                name="barcode"
                id="adduser_barcode"
                component={TextField}
                fullWidth
              />
            </Col>
          </Row>
        </Accordion>
        <Modal
          footer={footer}
          id="recalculate_expirationdate_modal"
          label={<FormattedMessage id="ui-users.information.recalculate.modal.label" />}
          open={this.state.showInfoModal}
        >
          <div>
            <FormattedMessage
              id="ui-users.information.recalculate.modal.text"
              values={{ group, offset }}
            />
          </div>
        </Modal>
      </>
    );
  }
}

const selectFormValue = formValueSelector('userForm');

export default connect(
  store => ({
    selectedPatronGroup: selectFormValue(store, 'patronGroup'),
  })
)(injectIntl(EditUserInfo));
