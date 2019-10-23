import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { FormattedMessage, injectIntl } from 'react-intl';

import { ViewMetaData } from '@folio/stripes/smart-components';
import {
  Select,
  TextField,
  Row,
  Col,
  Accordion,
  Datepicker,
  Headline
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

    const isStatusFieldDisabled = () => {
      let statusFieldDisabled = false;
      statusFieldDisabled = isUserExpired();
      return statusFieldDisabled;
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
        value: 'true',
        label: intl.formatMessage({ id: 'ui-users.active' })
      },
      {
        value: 'false',
        label: intl.formatMessage({ id: 'ui-users.inactive' })
      }
    ];

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
              selectClass={css.patronGroup}
              fullWidth
              dataOptions={patronGroupOptions}
              defaultValue={initialValues.patronGroup}
            />
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
              dataOptions={statusOptions}
              format={(value) => (value ? 'true' : 'false')}
              defaultValue={initialValues.active}
            />
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

export default injectIntl(EditUserInfo);
