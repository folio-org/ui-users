import React from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import {
  Select,
  TextField,
  Row,
  Col,
  Accordion,
  Datepicker,
  Headline
} from '@folio/stripes/components';
import { ViewMetaData } from '@folio/stripes/smart-components';

class EditUserInfo extends React.Component {
  static propTypes = {
    patronGroups: PropTypes.arrayOf(PropTypes.object),
    initialValues: PropTypes.object,
    expanded: PropTypes.bool,
    onToggle: PropTypes.func,
    accordionId: PropTypes.string.isRequired,
  };

  render() {
    const {
      patronGroups,
      initialValues,
      expanded,
      onToggle,
      accordionId,
    } = this.props;

    const patronGroupOptions = patronGroups.map(g => (
      <option key={g.id} value={g.id}>{g.group.concat(g.desc ? ` (${g.desc})` : '')}</option>
    ));
    const isUserExpired = () => {
      const expirationDate = new Date(initialValues.expirationDate);
      const now = Date.now();
      return expirationDate <= now;
    };

    const isStatusFieldDisabled = () => {
      let statusFieldDisabled = false;
      statusFieldDisabled = isUserExpired();
      return statusFieldDisabled;
    };

    return (
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
              label={<FormattedMessage id="ui-users.information.barcode" />}
              name="barcode"
              id="adduser_barcode"
              component={TextField}
              fullWidth
            />
          </Col>
        </Row>

        <Row>
          <Col xs={12} md={3}>
            <Field
              label={(
                <FormattedMessage id="ui-users.information.patronGroup">
                  {(msg) => msg + ' *'}
                </FormattedMessage>
              )}
              name="patronGroup"
              id="adduser_group"
              component={Select}
              fullWidth
              defaultValue={initialValues.patronGroup}
            >
              <FormattedMessage id="ui-users.information.selectPatronGroup">
                {(message) => <option value="">{message}</option>}
              </FormattedMessage>
              {patronGroupOptions}
            </Field>
          </Col>
          <Col xs={12} md={3}>
            <Field
              label={(
                <FormattedMessage id="ui-users.information.status">
                  {(msg) => msg + ' *'}
                </FormattedMessage>
              )}
              name="active"
              id="useractive"
              component={Select}
              fullWidth
              disabled={isStatusFieldDisabled()}
              defaultValue={initialValues.active}
            >
              <FormattedMessage id="ui-users.active">
                {(message) => <option value="true">{message}</option>}
              </FormattedMessage>
              <FormattedMessage id="ui-users.inactive">
                {(message) => <option value="false">{message}</option>}
              </FormattedMessage>
            </Field>
            {isUserExpired() && (
              <span style={{ 'color': '#900', 'position': 'relative', 'top': '-10px', 'fontSize': '0.9em' }}>
                <FormattedMessage id="ui-users.errors.userExpired" />
              </span>
            )}
          </Col>
          <Col xs={12} md={3}>
            <Field
              component={Datepicker}
              label={<FormattedMessage id="ui-users.expirationDate" />}
              dateFormat="YYYY-MM-DD"
              name="expirationDate"
              id="adduser_expirationdate"
            />
          </Col>
        </Row>
      </Accordion>
    );
  }
}

export default EditUserInfo;
