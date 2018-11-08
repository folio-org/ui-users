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
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
    }).isRequired,
    parentResources: PropTypes.object,
    initialValues: PropTypes.object,
    expanded: PropTypes.bool,
    onToggle: PropTypes.func,
    accordionId: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);

    this.cViewMetaData = this.props.stripes.connect(ViewMetaData);
  }

  render() {
    const {
      parentResources,
      initialValues,
      expanded,
      onToggle,
      accordionId,
    } = this.props;
    const patronGroups = (parentResources.patronGroups || {}).records || [];
    const patronGroupOptions = (patronGroups || []).map(g => ({ label: g.group.concat(g.desc ? ` (${g.desc})` : ''), value: g.id, selected: initialValues.patronGroup === g.id }));
    const statusOptions = [
      {
        label: <FormattedMessage id="ui-users.active" />,
        value: true,
      },
      {
        label: <FormattedMessage id="ui-users.inactive" />,
        value: false,
      },
    ].map(s => ({ ...s, selected: (initialValues.active === s.value || s.value === true) }));

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

        <this.cViewMetaData metadata={initialValues.metadata} />

        <Row>
          <Col xs={12} md={3}>
            <Field
              label={`${<FormattedMessage id="ui-users.information.lastName" />} *`}
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
              label={`${<FormattedMessage id="ui-users.information.patronGroup" />} *`}
              name="patronGroup"
              id="adduser_group"
              component={Select}
              fullWidth
              dataOptions={[
                {
                  label: <FormattedMessage id="ui-users.information.selectPatronGroup" />,
                  value: ''
                },
                ...patronGroupOptions,
              ]}
            />
          </Col>
          <Col xs={12} md={3}>
            <Field
              label={`${<FormattedMessage id="ui-users.information.status" />} *`}
              name="active"
              id="useractive"
              component={Select}
              fullWidth
              dataOptions={statusOptions}
              disabled={isStatusFieldDisabled()}
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

export default EditUserInfo;
