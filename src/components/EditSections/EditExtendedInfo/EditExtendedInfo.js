import React from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  TextField,
  Row,
  Col,
  Accordion,
  KeyValue,
  Datepicker,
} from '@folio/stripes/components';
import { Field } from 'redux-form';

import css from './EditExtendedInfo.css';

class EditExtendedInfo extends React.Component {
  constructor() {
    super();
    this.state = { showPassword: false };
  }

  togglePassword() {
    this.setState(({ showPassword }) => ({
      showPassword: !showPassword
    }));
  }

  render() {
    const { expanded, onToggle, accordionId, initialValues } = this.props;
    return (
      <Accordion
        open={expanded}
        id={accordionId}
        onToggle={onToggle}
        label={this.props.stripes.intl.formatMessage({ id: 'ui-users.extended.extendedInformation' })}
      >
        <Row>
          <Col xs={12} md={3}>
            <Field
              component={Datepicker}
              label={this.props.stripes.intl.formatMessage({ id: 'ui-users.extended.dateEnrolled' })}
              dateFormat="YYYY-MM-DD"
              name="enrollmentDate"
              id="adduser_enrollmentdate"
            />
          </Col>
          <Col xs={12} md={3}>
            <Field
              label={this.props.stripes.intl.formatMessage({ id: 'ui-users.extended.externalSystemId' })}
              name="externalSystemId"
              id="adduser_externalsystemid"
              component={TextField}
              fullWidth
            />
          </Col>
          <Col xs={12} md={3}>
            <Field
              component={Datepicker}
              label={this.props.stripes.intl.formatMessage({ id: 'ui-users.extended.birthDate' })}
              dateFormat="YYYY-MM-DD"
              name="personal.dateOfBirth"
              id="adduser_dateofbirth"
              timeZone="UTC"
              backendDateStandard="YYYY-MM-DD"
            />
          </Col>
          <Col xs={12} md={3}>
            <KeyValue label={this.props.stripes.intl.formatMessage({ id: 'ui-users.extended.folioNumber' })}>
              {initialValues.id || '-'}
            </KeyValue>
          </Col>
        </Row>
        {!initialValues.id &&
          <Row>
            <Col xs={4}>
              <Field
                component={TextField}
                label={`${this.props.stripes.intl.formatMessage({ id: 'ui-users.extended.folioPassword' })} `}
                name="creds.password"
                id="pw"
                autoComplete="new-password"
                type={this.state.showPassword ? 'text' : 'password'}
                fullWidth
              />
            </Col>
            <Col xs={1}>
              <div className={css.togglePw}>
                <Button id="toggle_pw_btn" onClick={() => this.togglePassword()}>
                  {this.state.showPassword ? this.props.stripes.intl.formatMessage({ id: 'ui-users.hide' }) : this.props.stripes.intl.formatMessage({ id: 'ui-users.show' })}
                </Button>
              </div>
            </Col>
          </Row>
        }
        <br />
      </Accordion>
    );
  }
}

EditExtendedInfo.propTypes = {
  expanded: PropTypes.bool,
  onToggle: PropTypes.func,
  accordionId: PropTypes.string.isRequired,
  initialValues: PropTypes.object,
  stripes: PropTypes.shape({
    intl: PropTypes.object.isRequired,
  }).isRequired,
};

export default EditExtendedInfo;
