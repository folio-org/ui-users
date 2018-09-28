import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { Row, Col } from '@folio/stripes/components';
import { Select } from '@folio/stripes/components';
import { Datepicker } from '@folio/stripes/components';
import { TextField } from '@folio/stripes/components';
import { Accordion } from '@folio/stripes/components';
import { ViewMetaData } from '@folio/stripes/smart-components';

class EditUserInfo extends React.Component {
  static propTypes = {
    stripes: PropTypes.shape({
      intl: PropTypes.object.isRequired,
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
    const { parentResources, initialValues, expanded, onToggle, accordionId, stripes: { intl } } = this.props;
    const patronGroups = (parentResources.patronGroups || {}).records || [];
    const patronGroupOptions = (patronGroups || []).map(g => ({ label: g.group.concat(g.desc ? ` (${g.desc})` : ''), value: g.id, selected: initialValues.patronGroup === g.id }));
    const statusOptions = [
      { label: intl.formatMessage({ id: 'ui-users.active' }), value: true },
      { label: intl.formatMessage({ id: 'ui-users.inactive' }), value: false },
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
        label={intl.formatMessage({ id: 'ui-users.information.userInformation' })}
        open={expanded}
        id={accordionId}
        onToggle={onToggle}
      >
        <Row>
          <Col xs={12}>
            <this.cViewMetaData metadata={initialValues.metadata} />
          </Col>
        </Row>
        <Row>
          <Col xs={8}>
            <Row>
              <Col xs={3}>
                <Field label={`${intl.formatMessage({ id: 'ui-users.information.lastName' })} *`} name="personal.lastName" id="adduser_lastname" component={TextField} required fullWidth />
              </Col>
              <Col xs={3}>
                <Field label={intl.formatMessage({ id: 'ui-users.information.firstName' })} name="personal.firstName" id="adduser_firstname" component={TextField} fullWidth />
              </Col>
              <Col xs={3}>
                <Field label={intl.formatMessage({ id: 'ui-users.information.middleName' })} name="personal.middleName" id="adduser_middlename" component={TextField} fullWidth />
              </Col>
              <Col xs={3}>
                <Field label={intl.formatMessage({ id: 'ui-users.information.barcode' })} name="barcode" id="adduser_barcode" component={TextField} fullWidth />
              </Col>
            </Row>

            <Row>
              <Col xs={3}>
                <Field
                  label={`${intl.formatMessage({ id: 'ui-users.information.patronGroup' })} *`}
                  name="patronGroup"
                  id="adduser_group"
                  component={Select}
                  fullWidth
                  dataOptions={[{ label: intl.formatMessage({ id: 'ui-users.information.selectPatronGroup' }), value: '' }, ...patronGroupOptions]}
                />
              </Col>
              <Col xs={3}>
                <Field
                  label={`${intl.formatMessage({ id: 'ui-users.information.status' })} *`}
                  name="active"
                  id="useractive"
                  component={Select}
                  fullWidth
                  dataOptions={statusOptions}
                  disabled={isStatusFieldDisabled()}
                />
                {isUserExpired() && (
                  <span style={{ 'color': '#900', 'position': 'relative', 'top': '-10px', 'fontSize': '0.9em' }}>
                    {`${intl.formatMessage({ id: 'ui-users.errors.userExpired' })}`}
                  </span>
                )}
              </Col>
              <Col xs={3}>
                <Field
                  component={Datepicker}
                  label={intl.formatMessage({ id: 'ui-users.expirationDate' })}
                  dateFormat="YYYY-MM-DD"
                  name="expirationDate"
                  id="adduser_expirationdate"
                />
              </Col>
              <Col xs={3}>
                <Field label={`${intl.formatMessage({ id: 'ui-users.information.username' })}`} name="username" id="adduser_username" component={TextField} fullWidth validStylesEnabled />
              </Col>
            </Row>
          </Col>
        </Row>
      </Accordion>
    );
  }
}

export default EditUserInfo;
